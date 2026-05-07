from django.urls import path
from .views import *

urlpatterns = [

    # -----------------------------------------------------------------
    # 💰 BILL URLs
    # -----------------------------------------------------------------
    path('bills/', BillListCreateView.as_view(), name='bill-list-create'),
    path('bills/<int:pk>/', BillDetailView.as_view(), name='bill-detail'),
    path("cashier/bills/", CashierBillListView.as_view(), name="cashier-bill-list"),
    path("cashier/bills/summary/", cashier_bill_summary, name="cashier-bill-summary"),

    path("patient_bill_records/<patient>/", get_patient_bill_records, name="patient_bill_records"),    

    # -----------------------------------------------------------------
    path('bill_and_pay_pending_services/', bill_and_pay_pending_services, name='bill_and_pay_pending_services'),

    # -----------------------------------------------------------------
    # 💵 PAYMENT URLs
    # -----------------------------------------------------------------
    path('payments/', PaymentListCreateView.as_view(), name='payment-list-create'),
    path('payments/<int:pk>/', PaymentDetailView.as_view(), name='payment-detail'),

    # 💳 BILL PAYMENT URL
    # -----------------------------------------------------------------
    path('bills/<int:bill_id>/pay/', pay_bill, name='pay-bill'),

    # 💳 CASHIER RECEIPT PROCESSING
    path('cashier/process-receipt/', cashier_process_receipt, name='cashier-process-receipt'),
    # WALK-IN PAYMENT URL
    path("walkin-payment/", walkin_payment_view, name="walkin-payment"),

    # -----------------------------------------------------------------
    # 🧾 PAYMENT DETAIL URLs
    # -----------------------------------------------------------------
    path('payment-details/', PaymentDetailListCreateView.as_view(), name='payment-detail-list-create'),
    path('payment-details/<int:pk>/', PaymentDetailItemView.as_view(), name='payment-detail-item'),

    # -----------------------------------------------------------------
    # 🪙 WALLET URLs
    # -----------------------------------------------------------------
    path('wallets/', WalletListView.as_view(), name='wallet-list'),
    path('wallets/<int:pk>/', WalletDetailView.as_view(), name='wallet-detail'),
    path('wallets/<int:pk>/deposit/', wallet_deposit, name='wallet-deposit'),
]
