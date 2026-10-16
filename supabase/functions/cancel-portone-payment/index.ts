const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return ok({ success: false, error: "인증이 필요합니다." });
    }

    const { orderId, reason } = await req.json() as { orderId?: string; reason?: string };
    if (!orderId || !reason?.trim()) {
      return ok({ success: false, error: "취소 정보가 올바르지 않습니다." });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return ok({ success: false, error: "서버 설정이 올바르지 않습니다." });
    }

    const adminHeaders = {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    };

    // Fetch the order
    const orderResponse = await fetch(
      `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=id,status,payment_method,portone_payment_id`,
      { headers: adminHeaders },
    );
    if (!orderResponse.ok) {
      return ok({ success: false, error: "주문 정보를 확인하지 못했습니다." });
    }
    const orders = await orderResponse.json() as Array<{
      id: string;
      status: string;
      payment_method: string | null;
      portone_payment_id: string | null;
    }>;
    const order = orders[0];
    if (!order || order.payment_method !== "card" || !order.portone_payment_id) {
      return ok({ success: false, error: "취소할 카드 결제 정보를 찾을 수 없습니다." });
    }
    if (!["paid", "payment_pending"].includes(order.status)) {
      return ok({ success: false, error: "현재 주문 상태에서는 취소할 수 없습니다." });
    }

    // Fetch PortOne settings from DB
    const settingsResponse = await fetch(
      `${supabaseUrl}/rest/v1/settings?key=eq.portone&select=value`,
      { headers: adminHeaders },
    );
    if (!settingsResponse.ok) {
      return ok({ success: false, error: "결제 설정을 불러오지 못했습니다." });
    }
    const settingsData = await settingsResponse.json() as Array<{ value: { storeId?: string; apiSecret?: string } }>;
    const portoneConfig = settingsData[0]?.value;
    if (!portoneConfig?.apiSecret || !portoneConfig?.storeId) {
      return ok({ success: false, error: "PortOne API 시크릿이 설정되지 않았습니다. 관리자 설정에서 등록해주세요." });
    }

    // Call PortOne V2 cancel API
    const cancelResponse = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(order.portone_payment_id)}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `PortOne ${portoneConfig.apiSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: portoneConfig.storeId,
          reason: reason.trim(),
        }),
      },
    );

    if (!cancelResponse.ok) {
      const errBody = await cancelResponse.text().catch(() => "");
      let portoneError = errBody;
      try {
        const parsed = JSON.parse(errBody);
        portoneError = parsed.message || parsed.error?.message || errBody;
      } catch { /* keep raw */ }
      return ok({ success: false, error: `결제 취소 실패 (${cancelResponse.status}): ${portoneError}` });
    }

    // Update order status to cancelled
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
      {
        method: "PATCH",
        headers: {
          ...adminHeaders,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          status: "cancelled",
          card_cancel_reason: reason.trim(),
          updated_at: new Date().toISOString(),
        }),
      },
    );
    if (!updateResponse.ok) {
      return ok({ success: false, error: "결제는 취소됐지만 주문 상태 저장에 실패했습니다." });
    }

    return ok({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "결제 취소 중 오류가 발생했습니다.";
    return ok({ success: false, error: msg });
  }
});

function ok(body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
