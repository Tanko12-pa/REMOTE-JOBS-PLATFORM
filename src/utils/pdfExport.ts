import { jsPDF } from 'jspdf';
import { ResumeContent, ImpactScore } from '../types';

export function exportResumeToPDF(resume: ResumeContent, title: string = 'Resume') {
  const doc = new jsPDF();
  let y = 20;

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(11, 79, 38); // Deep Green
  doc.text(resume.fullName || 'Alex Morgan', 20, y);
  y += 8;

  // Contact Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const contactText = `${resume.email} | ${resume.phone} | ${resume.location}`;
  doc.text(contactText, 20, y);
  y += 12;

  // Divider
  doc.setDrawColor(234, 179, 8); // Golden Yellow
  doc.setLineWidth(1);
  doc.line(20, y, 190, y);
  y += 10;

  // Professional Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(11, 79, 38);
  doc.text('PROFESSIONAL SUMMARY', 20, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  const summaryLines = doc.splitTextToSize(resume.summary, 170);
  doc.text(summaryLines, 20, y);
  y += summaryLines.length * 6 + 6;

  // Skills
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(11, 79, 38);
  doc.text('CORE SKILLS & COMPETENCIES', 20, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(resume.skills.join(' • '), 20, y);
  y += 12;

  // Experience
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(11, 79, 38);
  doc.text('PROFESSIONAL EXPERIENCE', 20, y);
  y += 7;

  resume.experience.forEach((exp) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(`${exp.title} - ${exp.company}`, 20, y);
    doc.setFont('helvetica', 'italic');
    doc.text(exp.period, 150, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    exp.points.forEach((pt) => {
      const ptLines = doc.splitTextToSize(`• ${pt}`, 165);
      doc.text(ptLines, 25, y);
      y += ptLines.length * 5;
    });
    y += 4;
  });

  // Education
  if (resume.education && resume.education.length) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(11, 79, 38);
    doc.text('EDUCATION', 20, y);
    y += 7;

    resume.education.forEach((edu) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(`${edu.degree}, ${edu.school} (${edu.year})`, 20, y);
      y += 6;
    });
  }

  doc.save(`${title.replace(/\s+/g, '_')}_Resume.pdf`);
}

export function exportCoverLetterToPDF(company: string, role: string, letterText: string) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(11, 79, 38);
  doc.text('APPLICATION LETTER', 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Role: ${role} | Company: ${company} | Date: ${new Date().toLocaleDateString()}`, 20, y);
  y += 12;

  doc.setDrawColor(234, 179, 8);
  doc.setLineWidth(1);
  doc.line(20, y, 190, y);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 30, 30);

  const lines = doc.splitTextToSize(letterText, 170);
  lines.forEach((line: string) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += 6;
  });

  doc.save(`${company.replace(/\s+/g, '_')}_Cover_Letter.pdf`);
}

export function exportSkillReportToPDF(userName: string, primarySkills: string[], goal: number) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(11, 79, 38);
  doc.text('REMOTE CAREER SKILL GAP REPORT', 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Prepared for: ${userName} | Date: ${new Date().toLocaleDateString()}`, 20, y);
  y += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(11, 79, 38);
  doc.text('PRIMARY SKILLS IDENTIFIED:', 20, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(primarySkills.join(', ') || 'General Professional Skills', 20, y);
  y += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(11, 79, 38);
  doc.text('RECOMMENDED SKILL UPGRADES FOR 2026 REMOTE hiring:', 20, y);
  y += 8;

  const upgrades = [
    '1. Asynchronous Communication & Written Documentation (Notion / Slack / Loom)',
    '2. Practical AI Tool Usage (Gemini, ChatGPT, Prompting for Workflow Automation)',
    '3. Cross-Timezone Self-Management & Jira / Trello Task Ownership',
    '4. International Payment & Tax Setup (Wise, Payoneer, Crypto Escrow basics)'
  ];

  upgrades.forEach((item) => {
    doc.text(item, 20, y);
    y += 7;
  });

  doc.save(`${userName.replace(/\s+/g, '_')}_Skill_Report.pdf`);
}
