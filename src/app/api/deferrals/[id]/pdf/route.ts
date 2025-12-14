import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deferrals } from "@/lib/db/schema";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import PDFDocument from "pdfkit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch deferral
    const deferral = await db
      .select()
      .from(deferrals)
      .where(eq(deferrals.id, id))
      .then((r) => r[0]);

    if (!deferral) {
      return Response.json({ error: "Deferral not found" }, { status: 404 });
    }

    // Helpers
    const fmtDate = (d?: Date | string | null) =>
      d ? new Date(d).toLocaleDateString() : "—";

    const fmtDateTime = (d?: Date | string | null) =>
      d ? new Date(d).toLocaleString() : "—";

    const formatArray = (arr?: string[] | null) =>
      Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "—";

    // Create PDF document
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    // Collect chunks into buffer
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    // Wait for PDF to finish
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    // Helper functions
    const addLabelValue = (label: string, value: string) => {
      const startY = doc.y;
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(label, 50, startY, { width: 140 });
      doc.font("Helvetica").text(value, 200, startY, { width: 300 });
      doc.moveDown(0.7);
    };

    const addDivider = () => {
      doc.moveDown(0.3);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.3);
    };

    const addSectionHeader = (title: string) => {
      doc.moveDown(0.5);
      doc.fontSize(13).font("Helvetica-Bold").fillColor("#1a5f7a").text(title);
      doc.fillColor("#000000");
      doc.moveDown(0.3);
    };

    // ========== HEADER ==========
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("DEFERRAL REQUEST", { align: "center" });

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Deferral Code: ${deferral.deferralCode}`, { align: "center" })
      .moveDown(0.3);

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });

    addDivider();

    // ========== 1. BASIC INFORMATION ==========
    addSectionHeader("1. Basic Information");

    addLabelValue("Initiator Name", deferral.initiatorName || "—");
    addLabelValue("Job Title", deferral.jobTitle || "—");
    addLabelValue("Department", deferral.department || "—");
    addLabelValue(
      "Equipment Description",
      deferral.equipmentDescription || "—"
    );
    addLabelValue(
      "Equipment Safety Criticality",
      deferral.equipmentSafetyCriticality || "—"
    );
    addLabelValue("Task Criticality", deferral.taskCriticality || "—");
    addLabelValue("Work Order Numbers", formatArray(deferral.workOrderNumbers));
    addLabelValue(
      "Equipment Full Codes",
      formatArray(deferral.equipmentFullCodes)
    );

    addDivider();

    // ========== 2. DEFERRAL DETAILS ==========
    addSectionHeader("2. Deferral Details");

    doc.fontSize(10).font("Helvetica-Bold").text("Description of Activity:");
    doc
      .font("Helvetica")
      .fontSize(9)
      .text(deferral.description || "—", { width: 480, paragraphGap: 4 });
    doc.moveDown(0.5);

    doc.fontSize(10).font("Helvetica-Bold").text("Justification:");
    doc
      .font("Helvetica")
      .fontSize(9)
      .text(deferral.justification || "—", { width: 480, paragraphGap: 4 });
    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Consequence of Not Performing:");
    doc
      .font("Helvetica")
      .fontSize(9)
      .text(deferral.consequence || "—", { width: 480, paragraphGap: 4 });
    doc.moveDown(0.5);

    addDivider();

    // ========== 3. DATES ==========
    addSectionHeader("3. Timeline");

    addLabelValue(
      "Deferral Request Date",
      fmtDate(deferral.deferralRequestDate)
    );
    addLabelValue("Current LAFD", fmtDate(deferral.currentLAFD));
    addLabelValue("Deferred To New LAFD", fmtDate(deferral.deferredToNewLAFD));
    addLabelValue("Submitted At", fmtDateTime(deferral.submittedAt));
    addLabelValue("Reviewed At", fmtDateTime(deferral.reviewedAt));
    addLabelValue("Implemented Date", fmtDate(deferral.implementedDate));
    addLabelValue("Approval Date", fmtDate(deferral.approvalDate));

    addDivider();

    // ========== 4. RISK ASSESSMENT ==========
    addSectionHeader("4. Risk Assessment");

    if (deferral.riskAssessment) {
      const risk = deferral.riskAssessment as Record<string, any>;
      Object.entries(risk).forEach(([category, details]: [string, any]) => {
        doc.fontSize(10).font("Helvetica-Bold").text(category.toUpperCase());
        if (details && typeof details === "object") {
          const severity = details.severity || "—";
          const likelihood = details.likelihood || "—";
          const justification = details.justification || "—";
          doc.fontSize(9).font("Helvetica");
          doc.text(`  Severity: ${severity}`);
          doc.text(`  Likelihood: ${likelihood}`);
          doc.text(`  Justification: ${justification}`);
        }
        doc.moveDown(0.3);
      });
    } else {
      doc.fontSize(9).font("Helvetica").text("No risk assessment provided.");
    }

    addDivider();

    // ========== 5. MITIGATIONS ==========
    addSectionHeader("5. Mitigations");

    if (deferral.mitigations && Array.isArray(deferral.mitigations)) {
      deferral.mitigations.forEach((mit: any, idx: number) => {
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .text(`Mitigation ${idx + 1}`);
        doc.fontSize(8).font("Helvetica");
        doc.text(`  Action No: ${mit.actionNo || "—"}`);
        doc.text(`  Action: ${mit.action || "—"}`);
        doc.text(`  Owner: ${mit.owner || "—"}`);
        doc.text(`  Date: ${mit.date || "—"}`);
        doc.text(`  Comments: ${mit.comments || "—"}`);
        doc.moveDown(0.3);
      });
    } else {
      doc.fontSize(9).font("Helvetica").text("No mitigations specified.");
    }

    addDivider();

    // ========== 6. STATUS & WORKFLOW ==========
    addSectionHeader("6. Status & Workflow");

    addLabelValue("Status", (deferral.status || "—").replace(/_/g, " "));
    addLabelValue("Reviewed By (User ID)", deferral.reviewedBy || "—");
    addLabelValue("Review Comments", deferral.reviewComments || "—");
    addLabelValue("Implemented By", deferral.implementedBy || "—");
    addLabelValue("Approved By", deferral.approvedBy || "—");

    addDivider();

    // ========== 7. ELECTRONIC SIGNATURES ==========
    addSectionHeader("7. Electronic Signatures");

    if (deferral.signatures && typeof deferral.signatures === "object") {
      const sigs = deferral.signatures as Record<string, any>;
      Object.entries(sigs).forEach(([role, sigData]: [string, any]) => {
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .text(role.toUpperCase().replace(/_/g, " "));
        if (sigData && typeof sigData === "object") {
          doc.fontSize(8).font("Helvetica");
          doc.text(`  Name: ${sigData.name || "—"}`);
          doc.text(`  Position: ${sigData.position || "—"}`);
          doc.text(`  Department: ${sigData.department || "—"}`);
          doc.text(`  Email: ${sigData.email || "—"}`);
          doc.text(
            `  Timestamp: ${
              sigData.timestamp
                ? new Date(sigData.timestamp).toLocaleString()
                : "—"
            }`
          );
          if (sigData.comments) {
            doc.text(`  Comments: ${sigData.comments}`);
          }
        }
        doc.moveDown(0.4);
      });
    } else {
      doc.fontSize(9).font("Helvetica").text("No signatures on file.");
    }

    addDivider();

    // ========== 8. COMMENTS ==========
    addSectionHeader("8. Additional Comments");

    if (deferral.comments && typeof deferral.comments === "object") {
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(JSON.stringify(deferral.comments, null, 2), {
          width: 480,
        });
    } else {
      doc.fontSize(9).font("Helvetica").text("No comments.");
    }

    // ========== FOOTER ==========
    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    doc
      .fontSize(8)
      .font("Helvetica")
      .text(
        "This is an electronically generated document. Verify authenticity with the system.",
        {
          align: "center",
        }
      );

    // Finalize PDF
    doc.end();

    // Wait for completion
    const pdfBuffer = await pdfPromise;

    // Return as binary response
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Deferral-${deferral.deferralCode}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return Response.json(
      { error: "Failed to generate PDF", details: String(error) },
      { status: 500 }
    );
  }
}
