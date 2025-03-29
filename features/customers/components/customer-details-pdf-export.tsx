import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import Loader from '@/components/loader';
import { Customer } from '../schemas';
import { ReactNode } from 'react';
import { getCustomerPdfFileName } from '@/lib/utils';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    marginBottom: 20,
    borderBottom: '1 solid #EAEAEA',
    paddingBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  infoSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 5,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#334155',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    width: '30%',
    fontSize: 10,
    color: '#64748B',
  },
  infoValue: {
    width: '70%',
    fontSize: 10,
    color: '#334155',
  },
  divider: {
    borderBottom: '1 solid #EAEAEA',
    marginVertical: 10,
  },
  pocSection: {
    marginBottom: 10,
  },
  pocTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#334155',
  },
  pocContainer: {
    marginBottom: 8,
    padding: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 10,
    borderTop: '1 solid #EAEAEA',
    paddingTop: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
});

const CustomerPdfDocument = ({ customer }: { customer: Customer }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Customer Profile</Text>
          <Text style={styles.subtitle}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
        </View>
        {/* Logo or image placeholder */}
        <View>
          {/* You can add a company logo here */}
          <Text style={{ fontSize: 12, color: '#2563EB', fontWeight: 'bold' }}>
            COMPANY LOGO
          </Text>
        </View>
      </View>

      {/* Basic Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Basic Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Customer Name:</Text>
          <Text style={styles.infoValue}>{customer.name}</Text>
        </View>

        {customer.customerType && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer Type:</Text>
            <Text style={styles.infoValue}>{customer.customerType}</Text>
          </View>
        )}

        {customer.gstNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>GST Number:</Text>
            <Text style={styles.infoValue}>{customer.gstNumber}</Text>
          </View>
        )}

        {customer.vendorId && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vendor ID:</Text>
            <Text style={styles.infoValue}>{customer.vendorId}</Text>
          </View>
        )}

        {customer.contactDetails && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact Details:</Text>
            <Text style={styles.infoValue}>{customer.contactDetails}</Text>
          </View>
        )}
      </View>

      {/* Address Section */}
      {customer.address && (
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Address</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address Line 1:</Text>
            <Text style={styles.infoValue}>{customer.address.address1}</Text>
          </View>

          {customer.address.address2 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address Line 2:</Text>
              <Text style={styles.infoValue}>{customer.address.address2}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>City:</Text>
            <Text style={styles.infoValue}>{customer.address.city}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>State:</Text>
            <Text style={styles.infoValue}>{customer.address.state}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Country:</Text>
            <Text style={styles.infoValue}>{customer.address.country}</Text>
          </View>

          {customer.address.pincode && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pincode:</Text>
              <Text style={styles.infoValue}>{customer.address.pincode}</Text>
            </View>
          )}
        </View>
      )}

      {/* Points of Contact Section */}
      {customer.poc && customer.poc.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Points of Contact</Text>

          {customer.poc.map((contact, index) => (
            <View key={index} style={styles.pocContainer}>
              <Text style={styles.pocTitle}>
                Contact {index + 1}: {contact.name}
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{contact.email}</Text>
              </View>

              {contact.mobile && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mobile:</Text>
                  <Text style={styles.infoValue}>{contact.mobile}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>• Generated with Enquiry Management System •</Text>
      </View>
    </Page>
  </Document>
);

const CustomerDetailsPDFExport = ({
  children,
  customer,
}: {
  children: ReactNode;
  customer: Customer;
}) => {
  const { name } = customer;
  return (
    <PDFDownloadLink
      document={<CustomerPdfDocument customer={customer} />}
      fileName={getCustomerPdfFileName({ name })}
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

export default CustomerDetailsPDFExport;
