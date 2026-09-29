/**
 * PortOne V2 SDK loader and payment utilities.
 * Dynamically loads the PortOne SDK from the CDN and provides
 * typed wrappers for requesting card payments.
 */

declare global {
  interface Window {
    PortOne?: PortOneSDK;
  }
}

interface PortOneSDK {
  requestPayment: (config: PortOnePaymentRequest) => Promise<PortOnePaymentResponse>;
}

export interface PortOnePaymentRequest {
  storeId: string;
  channelKey: string;
  paymentId: string;
  orderName: string;
  totalAmount: number;
  currency: "KRW" | "USD" | "EUR";
  payMethod: "CARD" | "TRANSFER" | "VIRTUAL_ACCOUNT";
  card?: {
    cardCompanies?: string[];
  };
  customer?: {
    customerId?: string;
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
  };
  redirectUrl?: string;
  noticeUrl?: string;
  productType?: "DIGITAL" | "PHYSICAL";
}

export interface PortOnePaymentResponse {
  paymentId: string;
  status: "PAID" | "FAILED" | "CANCELLED" | "PENDING";
}

let sdkPromise: Promise<PortOneSDK> | null = null;

function loadSDK(): Promise<PortOneSDK> {
  if (window.PortOne) return Promise.resolve(window.PortOne);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<PortOneSDK>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://cdn.portone.io/v2/sdk.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.PortOne) resolve(window.PortOne);
        else reject(new Error("PortOne SDK 로드에 실패했습니다."));
      });
      existing.addEventListener("error", () =>
        reject(new Error("PortOne SDK 로드에 실패했습니다."))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.portone.io/v2/sdk.js";
    script.async = true;
    script.onload = () => {
      if (window.PortOne) resolve(window.PortOne);
      else reject(new Error("PortOne SDK 로드에 실패했습니다."));
    };
    script.onerror = () => reject(new Error("PortOne SDK 로드에 실패했습니다."));
    document.head.appendChild(script);
  });

  return sdkPromise;
}

export interface RequestCardPaymentParams {
  storeId: string;
  channelKey: string;
  paymentId: string;
  orderName: string;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  redirectUrl: string;
}

export async function requestCardPayment(
  params: RequestCardPaymentParams
): Promise<PortOnePaymentResponse> {
  const sdk = await loadSDK();
  return sdk.requestPayment({
    storeId: params.storeId,
    channelKey: params.channelKey,
    paymentId: params.paymentId,
    orderName: params.orderName,
    totalAmount: params.totalAmount,
    currency: "KRW",
    payMethod: "CARD",
    productType: "PHYSICAL",
    customer: {
      fullName: params.customerName,
      phoneNumber: params.customerPhone,
      email: params.customerEmail,
    },
    redirectUrl: params.redirectUrl,
  });
}
