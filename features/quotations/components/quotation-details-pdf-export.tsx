import React, { ReactNode } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFDownloadLink,
} from '@react-pdf/renderer';
import { Quotation } from '../schemas';
import {
  formatCurrency,
  formatDate,
  getQuotationPdfFileName,
} from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Loader from '@/components/loader';

// Register custom fonts
Font.register({
  family: 'Open Sans',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf',
      fontWeight: 'semibold',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf',
      fontWeight: 'bold',
    },
  ],
});

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Open Sans',
    fontSize: 11,
    color: '#333333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  companyInfo: {
    width: '60%',
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2563eb',
  },
  companyDetail: {
    fontSize: 10,
    marginBottom: 2,
  },
  quotationTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#2563eb',
    textAlign: 'right',
  },
  quoteInfo: {
    textAlign: 'right',
  },
  quoteDetail: {
    fontSize: 10,
    marginBottom: 4,
  },
  customerSection: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2563eb',
  },
  customerInfo: {
    fontSize: 10,
    marginBottom: 3,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f2f6ff',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
    fontSize: 9,
  },
  tableRowEven: {
    backgroundColor: '#f8fafc',
  },
  tableCol1: {
    width: '20%',
  },
  tableCol2: {
    width: '30%',
  },
  tableCol3: {
    width: '10%',
    textAlign: 'center',
  },
  tableCol4: {
    width: '10%',
    textAlign: 'center',
  },
  tableCol5: {
    width: '10%',
    textAlign: 'right',
  },
  tableCol6: {
    width: '10%',
    textAlign: 'center',
  },
  tableCol7: {
    width: '20%',
    textAlign: 'right',
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    padding: 8,
    borderTop: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    width: '20%',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    width: '20%',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  termsSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#6b7280',
    paddingTop: 10,
    borderTop: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    marginBottom: 3,
  },
  signature: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '40%',
  },
  signatureTitle: {
    fontSize: 10,
    marginBottom: 40,
  },
  signatureLine: {
    borderTop: 1,
    borderTopColor: '#6b7280',
    marginBottom: 5,
  },
  viewer: {
    width: '100%',
    height: 600,
    border: 'none',
    borderRadius: 5,
  },
});

const QuotationPdfDocument = ({ quotation }: { quotation: Quotation }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>
            {quotation.myCompanyName || 'Company Name'}
          </Text>
          <Text style={styles.companyDetail}>
            GSTIN: {quotation.myCompanyGSTIN || 'N/A'}
          </Text>
          <Text style={styles.companyDetail}>
            PAN: {quotation.myCompanyPAN || 'N/A'}
          </Text>
        </View>
        <View>
          <Text style={styles.quotationTitle}>QUOTATION</Text>
          <View style={styles.quoteInfo}>
            <Text style={styles.quoteDetail}>
              Quote #: {quotation.quoteNumber}
            </Text>
            <Text style={styles.quoteDetail}>
              Date: {formatDate(new Date(quotation.quotationDate!))}
            </Text>
            {quotation.enquiryNumber && (
              <Text style={styles.quoteDetail}>
                Ref Enquiry #: {quotation.enquiryNumber}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Customer Section */}
      <View style={styles.customerSection}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <Text style={styles.customerInfo}>Name: {quotation.customerName}</Text>
        <Text style={styles.customerInfo}>
          Customer ID: {quotation.customerId}
        </Text>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCol1}>Item Code</Text>
          <Text style={styles.tableCol2}>Description</Text>
          <Text style={styles.tableCol3}>Qty</Text>
          <Text style={styles.tableCol4}>UOM</Text>
          <Text style={styles.tableCol5}>Rate</Text>
          <Text style={styles.tableCol6}>Currency</Text>
          <Text style={styles.tableCol7}>Amount</Text>
        </View>

        {quotation.items.map((item, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              ...(index % 2 === 1 ? [styles.tableRowEven] : []),
            ]}
          >
            <Text style={styles.tableCol1}>{item.itemCode}</Text>
            <Text style={styles.tableCol2}>{item.itemDescription}</Text>
            <Text style={styles.tableCol3}>{item.quantity}</Text>
            <Text style={styles.tableCol4}>{item.uom || 'Pcs'}</Text>
            <Text style={styles.tableCol5}>{item.rate?.toFixed(2)}</Text>
            <Text style={styles.tableCol6}>{item.currency || 'USD'}</Text>
            <Text style={styles.tableCol7}>
              {formatCurrency(item.amount, item.currency || 'USD')}
            </Text>
          </View>
        ))}

        <View style={styles.total}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(
              quotation.totalAmount,
              quotation.items[0]?.currency || 'USD'
            )}
          </Text>
        </View>
      </View>

      {/* Terms and Conditions */}
      <View style={styles.termsSection}>
        <Text style={styles.sectionTitle}>Terms and Conditions</Text>
        <Text>{quotation.termsAndConditions}</Text>
      </View>

      {/* Signature Section */}
      <View style={styles.signature}>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureTitle}>Customer Signature</Text>
          <Text style={styles.signatureLine}></Text>
          <Text>Date:</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureTitle}>
            For {quotation.myCompanyName}
          </Text>
          <Text style={styles.signatureLine}></Text>
          <Text>Authorized Signatory</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>• Generated with Enquiry Management System •</Text>
      </View>
    </Page>
  </Document>
);

const QuotationDetailsPDFExport = ({
  children,
  quotation,
}: {
  children: ReactNode;
  quotation: Quotation;
}) => {
  const { quoteNumber, customerName } = quotation;
  return (
    <PDFDownloadLink
      document={<QuotationPdfDocument quotation={quotation} />}
      fileName={getQuotationPdfFileName({ customerName, quoteNumber })}
    >
      {({ loading }) =>
        loading ? (
          <Button variant="outline" disabled={loading}>
            <Loader />
          </Button>
        ) : (
          children
        )
      }
    </PDFDownloadLink>
  );
};

export default QuotationDetailsPDFExport;
