import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateStudentReportCard = async (studentData, performanceData, elementId) => {
  // elementId is the ID of the div containing the report card content
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff'
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(`report_card_${studentData.admission_no}_${performanceData.term}.pdf`);
};

export const generateClassReport = async (classData, performanceData, elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff'
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(`class_report_${classData.stream_name}_${performanceData.term}.pdf`);
};