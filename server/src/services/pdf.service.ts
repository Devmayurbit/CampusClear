import PDFDocument from "pdfkit";
// @ts-ignore - QRCode types not available
import QRCode from "qrcode";
import { env } from "../config/env";

export interface CertificateData {
  certificateId: string;
  studentName: string;
  enrollmentNo: string;
  program: string;
  batch: string;
  issuedDate: Date;
}

/**
 * Generate PDF No-Dues Certificate with QR Code
 */
export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate QR code first
      const verifyUrl = `${env.frontendUrl}/certificate/verify/${data.certificateId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 200,
        margin: 1,
      });

      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: `No-Dues Certificate - ${data.certificateId}`,
          Author: "CDGI",
          Subject: "No-Dues Clearance Certificate",
        },
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header - Institution Name
      doc.fontSize(26).font("Helvetica-Bold").text("CDGI", { align: "center" });
      doc.moveDown(0.3);

      doc.fontSize(14).font("Helvetica").text("Chameli Devi Group of Institutions", {
        align: "center",
      });
      doc.fontSize(11).text("Indira Gandhi Delhi Technical University for Women", {
        align: "center",
      });
      doc.fontSize(10).text("New Delhi, India", { align: "center" });

      doc.moveDown(1);

      // Decorative line
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

      doc.moveDown(1.5);

      // Certificate Title
      doc.fontSize(20)
        .font("Helvetica-Bold")
        .fillColor("#1a56db")
        .text("CERTIFICATE OF NO-DUES CLEARANCE", { align: "center" });

      doc.fillColor("#000000");
      doc.moveDown(2);

      // Certificate Body
      doc.fontSize(12).font("Helvetica").text("This is to certify that", { align: "center" });
      doc.moveDown(0.8);

      // Student Name (highlighted)
      doc.fontSize(16)
        .font("Helvetica-Bold")
        .fillColor("#1a56db")
        .text(data.studentName, { align: "center" });

      doc.fillColor("#000000");
      doc.moveDown(0.8);

      // Student Details
      doc.fontSize(11).font("Helvetica");
      doc.text(`Enrollment Number: ${data.enrollmentNo}`, { align: "center" });
      doc.text(`Program: ${data.program || "N/A"}`, { align: "center" });
      doc.text(`Batch: ${data.batch || "N/A"}`, { align: "center" });

      doc.moveDown(1.5);

      // Clearance Statement
      doc.fontSize(11).text(
        "has successfully completed all clearance requirements from all departments",
        {
          align: "center",
          width: 500,
        }
      );
      doc.text("of the institution including Library, Lab, Training & Placement, Sports, Accounts, Hostel, and Department/HOD.", {
        align: "center",
        width: 500,
      });

      doc.moveDown(2);

      // Certificate ID and Date
      doc.fontSize(10).font("Helvetica-Bold");
      doc.text(`Certificate ID: ${data.certificateId}`, { align: "center" });
      doc.font("Helvetica");
      doc.text(`Date Issued: ${data.issuedDate.toLocaleDateString("en-IN", {
        day: "2-digit", 
        month: "long",
        year: "numeric"
      })}`, {
        align: "center",
      });

      doc.moveDown(2);

      // QR Code (bottom right)
      if (qrCodeDataUrl) {
        const qrBuffer = Buffer.from(
          qrCodeDataUrl.replace(/^data:image\/png;base64,/, ""),
          "base64"
        );
        doc.image(qrBuffer, 450, 580, { width: 90, height: 90 });
        
        // QR code label
        doc.fontSize(8).text("Scan to verify", 455, 675, { width: 80, align: "center" });
      }

      // Signature Section (left side)
      doc.fontSize(10).font("Helvetica");
      doc.text("_____________________", 80, 600);
      doc.fontSize(9).text("Authorized Signature", 80, 620);
      doc.fontSize(8).fillColor("#666666").text("CDGI Administration", 80, 635);

      // Footer with verification note
      doc.fillColor("#666666");
      doc.fontSize(8)
        .text("", 50, 700)
        .text(
          "This is a digitally generated certificate. Verify authenticity at cdgi.edu/verify",
          {
            align: "center",
            width: 500,
          }
        );

      doc.fontSize(7).text(`Generated on: ${new Date().toISOString()}`, {
        align: "center",
        width: 500,
      });

      // Watermark (without rotate - not supported in this version)
      doc.fillColor("#f0f0f0");
      doc.fontSize(60)
        .font("Helvetica-Bold")
        .text("VERIFIED", 150, 350, {
          align: "center",
        });

      doc.end();
    } catch (error) {
      console.error("❌ PDF generation error:", error);
      reject(error);
    }
  });
}

/**
 * Validate certificate data before generation
 */
export function validateCertificateData(data: Partial<CertificateData>): data is CertificateData {
  return !!(
    data.certificateId &&
    data.studentName &&
    data.enrollmentNo &&
    data.issuedDate
  );
}
