import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const fullPath = url.pathname;
  const fnIndex = fullPath.indexOf("/admin-users");
  const path = fnIndex >= 0 ? fullPath.slice(fnIndex + "/admin-users".length) : "/";

  try {
    // Verify caller is authenticated admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse(401, { error: "인증이 필요합니다." });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      return jsonResponse(401, { error: "유효하지 않은 토큰입니다." });
    }

    // Check admin role via user_in_roles or app_metadata
    const userId = userData.user.id;
    const { data: roleData } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    const isAdmin = roleData !== null || userData.user.app_metadata?.role === "admin";
    if (!isAdmin) {
      return jsonResponse(403, { error: "관리자 권한이 필요합니다." });
    }

    // GET /admin-users/list — list all users
    if (path === "/list" && req.method === "GET") {
      const { data, error } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (error) throw error;
      const users: AdminUser[] = (data.users ?? []).map((u) => ({
        id: u.id,
        email: u.email ?? "",
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      }));
      return jsonResponse(200, { users });
    }

    // GET /admin-users/:id/detail — get user orders + cart
    const detailMatch = path.match(/^\/([^/]+)\/detail$/);
    if (detailMatch && req.method === "GET") {
      const targetUserId = detailMatch[1];
      // Get user email to match orders by customer_email
      const { data: targetUser } = await supabase.auth.admin.getUserById(targetUserId);
      const targetEmail = targetUser?.user?.email ?? null;

      const queries: Promise<unknown>[] = [
        supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", targetUserId)
          .order("created_at", { ascending: false })
          .limit(50)
          .then((r) => r.data ?? []),
      ];

      if (targetEmail) {
        queries.unshift(
          supabase
            .from("orders")
            .select("*")
            .eq("customer_email", targetEmail)
            .order("created_at", { ascending: false })
            .limit(50)
            .then((r) => r.data ?? [])
        );
      } else {
        queries.unshift(Promise.resolve([]));
      }

      const [orders, cartItems] = await Promise.all(queries);
      return jsonResponse(200, { orders, cartItems });
    }

    // POST /admin-users/:id/reset-password — update password
    const resetMatch = path.match(/^\/([^/]+)\/reset-password$/);
    if (resetMatch && req.method === "POST") {
      const targetUserId = resetMatch[1];
      const body = await req.json();
      const newPassword = body?.password;
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return jsonResponse(400, { error: "비밀번호는 6자 이상이어야 합니다." });
      }
      const { error } = await supabase.auth.admin.updateUserById(targetUserId, {
        password: newPassword,
      });
      if (error) throw error;
      return jsonResponse(200, { ok: true });
    }

    return jsonResponse(404, { error: "지원하지 않는 요청입니다." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "요청 처리 중 오류가 발생했습니다.";
    return jsonResponse(500, { error: msg });
  }

  function jsonResponse(status: number, body: Record<string, unknown>): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
