/**
 * PortOne V2 SDK wrapper for card payment requests.
 */
import * as PortOne from "@portone/browser-sdk/v2";

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
) {
  return PortOne.requestPayment({
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
