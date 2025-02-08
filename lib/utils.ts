import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generatePDF = async (componentId: string, filename: string) => {
  const html2pdf = await import("html2pdf.js");
  const element = document.getElementById(componentId);
  html2pdf.default().from(element).set({ margin: 20 }).save(`${filename}.pdf`);
};

export function capitalizeFirstLetter(str: string) {
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  return capitalized;
}

export function formatDate(date: Date) {
  return dayjs(date).format(getDateDisplayFormat());
}

export function getDateDisplayFormat() {
  return "DD-MMM-YY";
}
