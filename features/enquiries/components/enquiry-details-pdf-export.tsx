import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import Loader from '@/components/loader';
import { Enquiry } from '../schemas';
import { ReactNode } from 'react';
import { formatCurrency, formatDate, getEnquiryPdfFileName } from '@/lib/utils';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    width: '60%',
  },
  headerRight: {
    width: '40%',
    alignItems: 'flex-end',
  },
  companyLogo: {
    width: 120,
    height: 50,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 9,
    color: '#666',
    marginBottom: 3,
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a73e8',
  },
  documentInfo: {
    fontSize: 10,
    color: '#444',
    marginBottom: 3,
  },
  section: {
    marginTop: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    padding: 5,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  customerInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  customerDetail: {
    fontSize: 10,
    marginBottom: 3,
    color: '#444',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 30,
  },
  tableRowHeader: {
    backgroundColor: '#f2f6ff',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableRowOdd: {
    backgroundColor: '#fafafa',
  },
  tableRowEven: {
    backgroundColor: '#ffffff',
  },
  tableCol: {
    padding: 8,
    fontSize: 10,
  },
  tableColHeader: {
    fontWeight: 'bold',
    color: '#1a73e8',
    fontSize: 10,
  },
  tableColItemCode: {
    width: '15%',
  },
  tableColDescription: {
    width: '60%',
  },
  tableColQuantity: {
    width: '15%',
    textAlign: 'center',
  },
  tableColPrice: {
    width: '15%',
    textAlign: 'right',
  },
  totals: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsTable: {
    width: '40%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
  },
  totalsBold: {
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  termsSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#444',
  },
  termsText: {
    fontSize: 9,
    color: '#666',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#888',
    fontSize: 9,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderTopStyle: 'solid',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 9,
    color: '#888',
  },
});

// Placeholder logo URL - in a real app you would import your logo
const LOGO_URL = 'https://via.placeholder.com/120x50.png?text=COMPANY+LOGO';

// Create Document Component
export const EnquiryPdfDocument = ({ enquiry }: { enquiry: Enquiry }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.companyName}>Your Company Name</Text>
          <Text style={styles.companyDetails}>
            123 Business Avenue, Suite 100
          </Text>
          <Text style={styles.companyDetails}>San Francisco, CA 94107</Text>
          <Text style={styles.companyDetails}>
            +1 (123) 456-7890 | info@yourcompany.com
          </Text>
        </View>
        <View style={styles.headerRight}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={LOGO_URL} style={styles.companyLogo} />
          <Text style={styles.documentTitle}>ENQUIRY</Text>
          <Text style={styles.documentInfo}>
            Number: {enquiry.enquiryNumber}
          </Text>
          <Text style={styles.documentInfo}>
            Date: {formatDate(new Date(enquiry.enquiryDate))}
          </Text>
          <Text style={styles.documentInfo}>
            Due Date: {formatDate(new Date(enquiry.quotationDueDate))}
          </Text>
        </View>
      </View>

      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{enquiry.customer?.name || 'Unknown'}</Text>
        <Text style={styles.customerDetail}>
          Customer ID: {enquiry.customerId}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <View
              style={[
                styles.tableCol,
                styles.tableColHeader,
                styles.tableColItemCode,
              ]}
            >
              <Text>Item Code</Text>
            </View>
            <View
              style={[
                styles.tableCol,
                styles.tableColHeader,
                styles.tableColDescription,
              ]}
            >
              <Text>Description</Text>
            </View>
            <View
              style={[
                styles.tableCol,
                styles.tableColHeader,
                styles.tableColQuantity,
              ]}
            >
              <Text>Quantity</Text>
            </View>
          </View>

          {/* Table Rows */}
          {enquiry.items.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
              ]}
            >
              <View style={[styles.tableCol, styles.tableColItemCode]}>
                <Text>{item.itemCode || 'N/A'}</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColDescription]}>
                <Text>{item.itemDescription}</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColQuantity]}>
                <Text>{item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {(enquiry.totalItemsPrice || enquiry.totalItemsFinalPrice) && (
        <View style={styles.totals}>
          <View style={styles.totalsTable}>
            {enquiry.totalItemsPrice && (
              <View style={styles.totalsRow}>
                <Text>Subtotal:</Text>
                <Text>{formatCurrency(enquiry.totalItemsPrice)}</Text>
              </View>
            )}
            {enquiry.totalItemsFinalPrice && (
              <View style={[styles.totalsRow, styles.totalsBold]}>
                <Text>Total:</Text>
                <Text>{formatCurrency(enquiry.totalItemsFinalPrice)}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {enquiry.termsAndConditions && (
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms and Conditions</Text>
          <Text style={styles.termsText}>{enquiry.termsAndConditions}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text>• Generated with Enquiry Management System •</Text>
      </View>

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </Page>
  </Document>
);

const EnquiryDetailsPDFExport = ({
  children,
  enquiry,
}: {
  children: ReactNode;
  enquiry: Enquiry;
}) => {
  const customerName = enquiry?.customer?.name || 'Unknown';
  const { enquiryNumber } = enquiry || {};
  return (
    <PDFDownloadLink
      document={<EnquiryPdfDocument enquiry={enquiry} />}
      fileName={getEnquiryPdfFileName({
        customerName,
        enquiryNumber,
      })}
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

export default EnquiryDetailsPDFExport;
