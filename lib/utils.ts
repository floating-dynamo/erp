import { Customer } from "@/features/customers/schemas";
import { Enquiry } from "@/features/enquiries/schemas";
import { Quotation } from "@/features/quotations/schemas";
import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateCsv = ({
  data,
  type,
}:
  | { data: Customer; type: "Customer" }
  | { data: Enquiry; type: "Enquiry" }
  | { data: Quotation; type: "Quotation" }) => {
  if (!data) return;
  let headers: string[] = [];
  const rows: (string | number | undefined)[][] = [];
  let fileName = "";

  switch (type) {
    case "Customer": {
      headers = [
        "Customer ID",
        "Name",
        "Customer Type",
        "Vendor ID",
        "GST Number",
        "Contact Number",
        "Address Line 1",
        "Address Line 2",
        "City",
        "State",
        "Country",
        "Pincode",
        "POC Name",
        "POC Email",
        "POC Mobile",
      ];

      rows.push([
        data.id,
        data.name,
        data.customerType,
        data.vendorId || "NA",
        data.gstNumber || "NA",
        data.contactDetails || "NA",
        data.address?.address1 || "NA",
        data.address?.address2 || "NA",
        data.address?.city || "NA",
        data.address?.state || "NA",
        data.address?.country || "NA",
        data.address?.pincode || "NA",
        data.poc?.map((p) => p.name).join(", ") || "NA",
        data.poc?.map((p) => p.email).join(", ") || "NA",
        data.poc?.map((p) => p.mobile || "NA").join(", ") || "NA",
      ]);

      fileName = `${data.name.replace(/\s/g, "_")}.csv`;

      break;
    }
    case "Enquiry": {
      headers = [
        "Enquiry ID",
        "Customer ID",
        "Customer Name",
        "Enquiry Number",
        "Enquiry Date",
        "Quotation Due Date",
        "Item Code",
        "Item Description",
        "Quantity",
        "Terms and Conditions",
        "Is Quotation Created",
      ];

      data.items.map((item) => {
        rows.push([
          data.id || "NA",
          data.customerId,
          data.customerName || "NA",
          data.enquiryNumber,
          formatDate(new Date(data.enquiryDate)),
          formatDate(new Date(data.quotationDueDate)),
          item.itemCode || "NA",
          item.itemDescription,
          item.quantity,
          data?.termsAndConditions?.replace(/\n/g, " ") || "NA" || "NA",
          data.isQotationCreated ? "Yes" : "No",
        ]);
      });

      fileName = `Enquiry_${data.customerName?.replace(/\s/g, "_")}.csv`;
      break;
    }

    case "Quotation": {
      headers = [
        "Quotation ID",
        "Customer ID",
        "Customer Name",
        "Enquiry Number",
        "Quotation Date",
        "Quote Number",
        "Item Code",
        "Item Description",
        "Material Consideration",
        "Quantity",
        "UOM",
        "Rate",
        "Currency",
        "Amount",
        "Remarks",
        "Total Amount",
        "Terms and Conditions",
        "Company GSTIN",
        "Company PAN",
        "Company Name",
      ];

      data.items.forEach((item) => {
        rows.push([
          data.id,
          data.customerId,
          data.customerName,
          data.enquiryNumber,
          formatDate(new Date(data.quotationDate)),
          data.quoteNumber,
          item.itemCode,
          item.itemDescription,
          item.materialConsideration || "NA",
          item.quantity,
          item.uom,
          item.rate,
          item.currency,
          item.amount,
          item.remarks || "NA",
          data.totalAmount,
          data.termsAndConditions?.replace(/\n/g, " ") || "NA",
          data.myCompanyGSTIN,
          data.myCompanyPAN,
          data.myCompanyName,
        ]);
      });

      fileName = `Quotation_${data.customerName.replace(/\s/g, "_")}.csv`;
      break;
    }
  }

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generatePDF = async (componentId: string, filename: string) => {
  const html2pdf = await import("html2pdf.js");
  const element = document.getElementById(componentId);
  html2pdf.default().from(element).set({ margin: 20 }).save(`${filename}.pdf`);
};

export function capitalizeFirstLetter(str: string) {
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  return capitalized;
}

export const generateQuoteNumber = (isoDate: string, enquiryNumber: string) => {
  const quoteNumDateFormat = "YY/MM/DD";
  const date = dayjs(isoDate);
  const formattedDate = date.format(quoteNumDateFormat);
  return `QUO/${formattedDate}/${enquiryNumber}`;
};

export function formatDate(date: Date) {
  return dayjs(date).format(getDateDisplayFormat());
}

export function getDateDisplayFormat() {
  return "DD-MMM-YY";
}
