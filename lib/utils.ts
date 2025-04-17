import { Customer } from '@/features/customers/schemas';
import { Enquiry } from '@/features/enquiries/schemas';
import { Quotation } from '@/features/quotations/schemas';
import { clsx, type ClassValue } from 'clsx';
import dayjs from 'dayjs';
import { twMerge } from 'tailwind-merge';
import { MetaDataType } from './types';
import { SupplierDc } from '@/features/supplier-dc/schemas';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateCsv = ({
  data,
  type,
}:
  | { data: Customer; type: 'Customer' }
  | { data: Enquiry; type: 'Enquiry' }
  | { data: Quotation; type: 'Quotation' }
  | { data: SupplierDc; type: 'SupplierDc' }) => {
  if (!data) return;
  let headers: string[] = [];
  const rows: (string | number | undefined)[][] = [];
  let fileName = '';

  switch (type) {
    case 'Customer': {
      headers = [
        'Customer ID',
        'Name',
        'Customer Type',
        'Vendor ID',
        'GST Number',
        'Contact Number',
        'Address Line 1',
        'Address Line 2',
        'City',
        'State',
        'Country',
        'Pincode',
        'POC Name',
        'POC Email',
        'POC Mobile',
      ];

      rows.push([
        data.id,
        data.name,
        data.customerType,
        data.vendorId || 'NA',
        data.gstNumber || 'NA',
        data.contactDetails || 'NA',
        data.address?.address1 || 'NA',
        data.address?.address2 || 'NA',
        data.address?.city || 'NA',
        data.address?.state || 'NA',
        data.address?.country || 'NA',
        data.address?.pincode || 'NA',
        data.poc?.map((p) => p.name).join(', ') || 'NA',
        data.poc?.map((p) => p.email).join(', ') || 'NA',
        data.poc?.map((p) => p.mobile || 'NA').join(', ') || 'NA',
      ]);

      fileName = `${data.name.replace(/\s/g, '_')}.csv`;

      break;
    }
    case 'Enquiry': {
      headers = [
        'Enquiry ID',
        'Customer ID',
        'Customer Name',
        'Enquiry Number',
        'Enquiry Date',
        'Quotation Due Date',
        'Item Code',
        'Item Description',
        'Quantity',
        'Terms and Conditions',
        'Is Quotation Created',
      ];

      data.items.map((item) => {
        rows.push([
          data.id || 'NA',
          data.customerId,
          data.customerName || 'NA',
          data.enquiryNumber,
          formatDate(new Date(data.enquiryDate)),
          formatDate(new Date(data.quotationDueDate)),
          item.itemCode || 'NA',
          item.itemDescription,
          item.quantity,
          data?.termsAndConditions?.replace(/\n/g, ' ') || 'NA' || 'NA',
          data.isQotationCreated ? 'Yes' : 'No',
        ]);
      });

      fileName = `${data.customerName?.replace(/\s/g, '_')}_Enquiry_${
        data.enquiryNumber
      }.csv`;
      break;
    }
    case 'Quotation': {
      headers = [
        'Quotation ID',
        'Customer ID',
        'Customer Name',
        'Enquiry Number',
        'Quotation Date',
        'Quote Number',
        'Item Code',
        'Item Description',
        'Material Consideration',
        'Quantity',
        'UOM',
        'Rate',
        'Currency',
        'Amount',
        'Remarks',
        'Total Amount',
        'Terms and Conditions',
        'Company GSTIN',
        'Company PAN',
        'Company Name',
      ];

      data.items.forEach((item) => {
        rows.push([
          data.id,
          data.customerId,
          data.customerName,
          data.enquiryNumber,
          formatDate(new Date(data?.quotationDate || '')),
          data.quoteNumber,
          item.itemCode,
          item.itemDescription,
          item.materialConsideration || 'NA',
          item.quantity,
          item.uom,
          item.rate,
          item.currency,
          item.amount,
          item.remarks || 'NA',
          data.totalAmount,
          data.termsAndConditions?.replace(/\n/g, ' ') || 'NA',
          data.myCompanyGSTIN,
          data.myCompanyPAN,
          data.myCompanyName,
        ]);
      });

      fileName = `Quotation_${data.customerName.replace(/\s/g, '_')}.csv`;
      break;
    }
    case 'SupplierDc': {
      headers = [
        'Supplier DC ID',
        'From',
        'To',
        'GSTIN',
        'PO Ref',
        'DC No',
        'Date',
        'Sl No',
        'WO No',
        'Description',
        'Qty',
        'Purpose',
        'Remarks',
      ];

      data.workOrders.forEach((wo, index) => {
        rows.push([
          data.id,
          data.from,
          data.to,
          data.gstIn,
          data.poRef,
          data.dcNo,
          formatDate(new Date(data.date)),
          index + 1,
          wo.woNumber,
          wo.woDescription,
          wo.qty,
          wo.purpose || 'NA',
          wo.remarks || 'NA',
        ]);
      });
      fileName = `Supplier_DC_${data.dcNo}.csv`;
      break;
    }
  }

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generatePDF = async (componentId: string, filename: string) => {
  const html2pdf = await import('html2pdf.js');
  const element = document.getElementById(componentId);
  html2pdf.default().from(element).set({ margin: 20 }).save(`${filename}.pdf`);
};

export function capitalizeFirstLetter(str: string) {
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  return capitalized;
}

export const generateQuoteNumber = (isoDate: string, enquiryNumber: string) => {
  const quoteNumDateFormat = 'YY/MM/DD';
  const date = dayjs(isoDate);
  const formattedDate = date.format(quoteNumDateFormat);
  return `QUO/${formattedDate}/${enquiryNumber}`;
};

export function formatDate(date: Date) {
  return dayjs(date).format(getDateDisplayFormat());
}

export const formatCurrency = (
  amount: number | undefined,
  currency: string = 'USD'
) => {
  if (amount === undefined) return '';

  // Use Intl API to format currency
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
};

export function getDateDisplayFormat() {
  return 'DD-MMM-YY';
}

export function getMetaData(
  type: MetaDataType
): { label: string; value: string }[] {
  switch (type) {
    case MetaDataType.UOM:
      return [
        { value: 'Kg', label: 'Kilograms (Kg)' },
        { value: 'g', label: 'Grams (g)' },
        { value: 'L', label: 'Litres (L)' },
        { value: 'mL', label: 'Mili Litres (mL)' },
        { value: 'Dz', label: 'Dozen (Dz)' },
        { value: 'm', label: 'Meter (m)' },
        { value: 'mm', label: 'Milimeter (mm)' },
      ];
    case MetaDataType.CURRENCY:
      return [
        { value: 'INR', label: 'Indian Rupees (INR)' },
        { value: 'USD', label: 'US Dollars (USD)' },
        { value: 'GBP', label: 'British Pound (GBP)' },
        { value: 'SGD', label: 'Singapore Dollar (SGD)' },
      ];
  }
}

export function getCustomerPdfFileName({ name }: { name: string }) {
  return `${name.replace(/\s/g, '_')}_Customer.pdf`;
}

export function getEnquiryPdfFileName({
  customerName,
  enquiryNumber,
}: {
  customerName: string;
  enquiryNumber: string;
}) {
  return `${customerName.replace(/\s/g, '_')}_Enquiry_${enquiryNumber}.pdf`;
}

export function getQuotationPdfFileName({
  customerName,
  quoteNumber,
}: {
  customerName: string;
  quoteNumber?: string;
}) {
  if (!quoteNumber) return `Quotation_${customerName.replace(/\s/g, '_')}.pdf`;
  return `Quotation_${quoteNumber}_${customerName.replace(/\s/g, '_')}.pdf`;
}

export const generateSupplierDCExcel = (data: SupplierDc) => {
  const wsData: (string | number)[][] = [];

  wsData[1] = [
    '',
    `DELIVERY CHALLAN [ Returnable (${
      data.returnable ? 'X' : ' '
    }) / Non Returnable (${data.nonreturnable ? 'X' : ' '}) ]`,
  ];

  wsData[2] = ['', 'From,', data.from, '', '', '', 'To,', data.to];

  wsData[6] = ['', 'DC No.', data.dcNo ?? '', '', '', '', 'GSTIN:', data.gstIn];
  wsData[7] = [
    '',
    'Date',
    formatDate(new Date(data.date)),
    '',
    '',
    '',
    'Our PO Ref:',
    data.poRef,
  ];

  wsData[8] = [
    '',
    'Sl. No.',
    'W O No.',
    'Description',
    '',
    'Qty',
    'Purpose',
    '',
    '',
    'Remarks',
  ];

  data.workOrders.forEach((wo, index) => {
    wsData[9 + index] = [
      '',
      index + 1,
      wo.woNumber,
      wo.woDescription,
      '',
      wo.qty,
      wo.purpose ?? '',
      '',
      '',
      wo.remarks ?? '',
    ];
  });

  wsData[18] = [
    '',
    '',
    '',
    '',
    '',
    '',
    'Prepared By:',
    '',
    'Authorised Signatory',
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Apply bold styling to the "DELIVERY CHALLAN" row
  ws['B2'].s = {
    font: {
      bold: true,
      sz: 18,
    },
    fill: {
      fgColor: { rgb: 'B4C6E7' },
    },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
    },
  };

  ws['!merges'] = [
    // Header
    { s: { r: 1, c: 1 }, e: { r: 1, c: 9 } },
    // GSTIN
    { s: { r: 6, c: 7 }, e: { r: 6, c: 9 } },
    // PO Ref
    { s: { r: 7, c: 7 }, e: { r: 7, c: 9 } },
    // Purpose
    { s: { r: 8, c: 6 }, e: { r: 8, c: 8 } },
    // Description
    { s: { r: 8, c: 3 }, e: { r: 8, c: 4 } },
    // Prepared By
    { s: { r: 18, c: 6 }, e: { r: 18, c: 7 } },
    // Authorised Signatory
    { s: { r: 18, c: 8 }, e: { r: 18, c: 9 } },
  ];

  // Auto-fit column widths
  ws['!cols'] = wsData.map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Supplier DC');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });

  saveAs(blob, `Supplier_DC_${data.dcNo}.xlsx`);
};
