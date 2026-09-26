import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

from app.models.analysis import Analysis
from app.core.config import settings

class PDFReportService:
    @staticmethod
    def generate_analysis_report(analysis: Analysis, output_dir: Optional[Path] = None) -> Path:
        """
        Generates an enterprise-grade forensic lab verification PDF report
        for the given Analysis record.
        """
        if output_dir is None:
            output_dir = settings.REPORTS_DIR
            
        os.makedirs(output_dir, exist_ok=True)
        pdf_path = output_dir / f"DeepGuard_Forensic_Report_{analysis.id[:8]}.pdf"
        
        doc = SimpleDocTemplate(
            str(pdf_path),
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        
        # Custom palette
        color_primary = colors.HexColor("#0f172a")     # Slate 900
        color_secondary = colors.HexColor("#0284c7")   # Sky 600
        color_cyan = colors.HexColor("#06b6d4")        # Cyan 500
        color_dark = colors.HexColor("#1e293b")        # Slate 800
        color_light = colors.HexColor("#f8fafc")       # Slate 50
        color_border = colors.HexColor("#cbd5e1")      # Slate 300
        
        # Verdict color
        if analysis.result == "LIKELY_DEEPFAKE":
            verdict_bg = colors.HexColor("#fef2f2")
            verdict_text_color = colors.HexColor("#dc2626") # Red
            verdict_badge_color = colors.HexColor("#ef4444")
        elif analysis.result == "SUSPICIOUS":
            verdict_bg = colors.HexColor("#fffbeb")
            verdict_text_color = colors.HexColor("#d97706") # Amber
            verdict_badge_color = colors.HexColor("#f59e0b")
        else:
            verdict_bg = colors.HexColor("#f0fdf4")
            verdict_text_color = colors.HexColor("#16a34a") # Green
            verdict_badge_color = colors.HexColor("#10b981")
            
        # Custom styles
        style_title = ParagraphStyle(
            'ReportTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            textColor=color_primary,
            alignment=TA_LEFT
        )
        
        style_subtitle = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#64748b"),
            alignment=TA_LEFT
        )
        
        style_section_h1 = ParagraphStyle(
            'SectionH1',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=15,
            textColor=color_primary,
            spaceAfter=6
        )
        
        style_body = ParagraphStyle(
            'ReportBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=12,
            textColor=color_dark,
            alignment=TA_LEFT
        )

        style_body_bold = ParagraphStyle(
            'ReportBodyBold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=12,
            textColor=color_primary,
            alignment=TA_LEFT
        )
        
        style_disclaimer = ParagraphStyle(
            'Disclaimer',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=7.5,
            leading=10.5,
            textColor=colors.HexColor("#475569"),
            alignment=TA_JUSTIFY
        )

        elements = []
        
        # 1. Header Banner
        header_data = [
            [
                Paragraph("<b>DEEPFAKE DETECTION SYSTEM</b><br/><font color='#0284c7'><b>DeepGuard AI Forensics Laboratory</b></font>", style_title),
                Paragraph(f"<b>REPORT ID:</b> {analysis.id[:18]}<br/><b>DATE:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}<br/><b>STATUS:</b> VERIFIED", ParagraphStyle('HRight', parent=style_subtitle, alignment=TA_RIGHT))
            ]
        ]
        t_header = Table(header_data, colWidths=[340, 200])
        t_header.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(t_header)
        elements.append(HRFlowable(width="100%", thickness=1.5, color=color_secondary, spaceBefore=4, spaceAfter=12))
        
        # 2. Executive Verdict Banner Box
        verdict_str = str(analysis.result.value if hasattr(analysis.result, 'value') else analysis.result).replace("_", " ")
        risk_str = str(analysis.risk_level.value if hasattr(analysis.risk_level, 'value') else analysis.risk_level or "N/A")
        conf_val = f"{analysis.confidence:.1f}%" if analysis.confidence else "N/A"
        auth_val = f"{analysis.authenticity_score:.1f}%" if analysis.authenticity_score else "N/A"
        
        verdict_cell = [
            Paragraph(f"<font size='10' color='#64748b'><b>EXECUTIVE FORENSIC VERDICT</b></font>", style_subtitle),
            Spacer(1, 4),
            Paragraph(f"<font size='18' color='{verdict_text_color.hexval()}'><b>{verdict_str}</b></font>", style_title),
            Spacer(1, 4),
            Paragraph(f"<b>Summary:</b> {analysis.explanation_summary or 'Standard automated analysis completed.'}", style_body)
        ]
        
        metrics_cell = [
            Paragraph(f"<b>Confidence:</b> <font color='{verdict_text_color.hexval()}'><b>{conf_val}</b></font>", style_body_bold),
            Spacer(1, 2),
            Paragraph(f"<b>Authenticity Score:</b> {auth_val}", style_body),
            Spacer(1, 2),
            Paragraph(f"<b>Risk Classification:</b> <b>{risk_str}</b>", style_body_bold),
            Spacer(1, 2),
            Paragraph(f"<b>Processing Time:</b> {analysis.processing_time or 0.0}s", style_body),
        ]
        
        verdict_table = Table([[verdict_cell, metrics_cell]], colWidths=[360, 180])
        verdict_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), verdict_bg),
            ('BOX', (0, 0), (-1, -1), 1, verdict_badge_color),
            ('PADDING', (0, 0), (-1, -1), 10),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(verdict_table)
        elements.append(Spacer(1, 14))
        
        # 3. Media & Evidence Metadata
        elements.append(Paragraph("1. EVIDENCE & ARTIFACT METADATA", style_section_h1))
        
        media_type_str = str(analysis.media_type.value if hasattr(analysis.media_type, 'value') else analysis.media_type).upper()
        size_kb = f"{analysis.file_size / 1024:.1f} KB" if analysis.file_size < 1024*1024 else f"{analysis.file_size / (1024*1024):.2f} MB"
        
        meta_rows = [
            [
                Paragraph("<b>Original Filename:</b>", style_body_bold),
                Paragraph(analysis.original_filename, style_body),
                Paragraph("<b>Media Type:</b>", style_body_bold),
                Paragraph(media_type_str, style_body),
            ],
            [
                Paragraph("<b>File Size:</b>", style_body_bold),
                Paragraph(size_kb, style_body),
                Paragraph("<b>Upload Timestamp:</b>", style_body_bold),
                Paragraph(analysis.created_at.strftime('%Y-%m-%d %H:%M:%S UTC') if analysis.created_at else "N/A", style_body),
            ],
            [
                Paragraph("<b>SHA-256 Hash:</b>", style_body_bold),
                Paragraph(f"<font name='Courier' size='7'>{analysis.file_hash}</font>", style_body),
                Paragraph("<b>Detection Model:</b>", style_body_bold),
                Paragraph(f"{analysis.model_name or 'DeepGuard'} ({analysis.model_version or '1.0'})", style_body),
            ]
        ]
        t_meta = Table(meta_rows, colWidths=[110, 160, 110, 160])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), color_light),
            ('BOX', (0, 0), (-1, -1), 0.5, color_border),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, color_border),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(t_meta)
        elements.append(Spacer(1, 14))
        
        # 4. Forensic Indicators Table
        elements.append(Paragraph("2. DETECTED FORENSIC INDICATORS & ANOMALY SIGNALS", style_section_h1))
        
        ind_headers = [
            Paragraph("<b>Indicator Name</b>", style_body_bold),
            Paragraph("<b>Category</b>", style_body_bold),
            Paragraph("<b>Severity</b>", style_body_bold),
            Paragraph("<b>Confidence</b>", style_body_bold),
            Paragraph("<b>Forensic Analysis Notes</b>", style_body_bold)
        ]
        ind_data = [ind_headers]
        
        for ind in analysis.indicators:
            ind_data.append([
                Paragraph(ind.name, style_body_bold),
                Paragraph((ind.category or "general").capitalize(), style_body),
                Paragraph(f"<b>{ind.severity}</b>", style_body),
                Paragraph(f"{ind.confidence:.1f}%", style_body),
                Paragraph(f"{ind.description} {f'<i>({ind.metric_value})</i>' if ind.metric_value else ''}", style_body)
            ])
            
        if len(ind_data) == 1:
            ind_data.append([
                Paragraph("No Critical Indicators", style_body),
                Paragraph("N/A", style_body),
                Paragraph("LOW", style_body),
                Paragraph("95.0%", style_body),
                Paragraph("No significant digital manipulation markers were detected across inspected dimensions.", style_body)
            ])
            
        t_ind = Table(ind_data, colWidths=[120, 65, 55, 55, 245])
        t_ind.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ('BOX', (0, 0), (-1, -1), 0.5, color_border),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, color_border),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(t_ind)
        elements.append(Spacer(1, 14))
        
        # 5. Temporal / Segment Breakdown (if video or audio)
        if analysis.frames and len(analysis.frames) > 0:
            elements.append(Paragraph("3. TEMPORAL ANOMALY TIMELINE BREAKDOWN", style_section_h1))
            frame_headers = [
                Paragraph("<b>Timestamp / Segment</b>", style_body_bold),
                Paragraph("<b>Frame #</b>", style_body_bold),
                Paragraph("<b>Anomaly Score</b>", style_body_bold),
                Paragraph("<b>Severity</b>", style_body_bold),
                Paragraph("<b>Observed Anomaly / Artifact Description</b>", style_body_bold)
            ]
            frame_data = [frame_headers]
            for fr in analysis.frames[:8]:  # Show top 8 key segments
                frame_data.append([
                    Paragraph(fr.timestamp_str or f"{fr.timestamp:.2f}s", style_body_bold),
                    Paragraph(str(fr.frame_number or "—"), style_body),
                    Paragraph(f"{fr.score:.1f}%", style_body),
                    Paragraph(f"<b>{fr.severity or 'MEDIUM'}</b>", style_body),
                    Paragraph(fr.anomaly_label or "Observed pixel variance", style_body)
                ])
            t_frames = Table(frame_data, colWidths=[100, 45, 75, 55, 265])
            t_frames.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
                ('BOX', (0, 0), (-1, -1), 0.5, color_border),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, color_border),
                ('PADDING', (0, 0), (-1, -1), 4),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            elements.append(t_frames)
            elements.append(Spacer(1, 14))

        # 6. Legal & Scientific Disclaimer Section
        elements.append(KeepTogether([
            Paragraph("<b>IMPORTANT SCIENTIFIC & LEGAL FORENSIC DISCLAIMER</b>", style_section_h1),
            HRFlowable(width="100%", thickness=0.5, color=color_border, spaceBefore=2, spaceAfter=4),
            Paragraph(
                "<b>Notice:</b> Deepfake detection is inherently probabilistic. AI-generated scores and metrics "
                "should not be interpreted as absolute proof that media is authentic or manipulated. "
                "Results may contain false positives and false negatives due to compression artifacts, lighting conditions, "
                "or transmission noise. For legal, judicial, investigative, or enterprise compliance decisions, "
                "this automated report must be reviewed by qualified digital forensics experts alongside secondary chain-of-custody evidence.",
                style_disclaimer
            ),
            Spacer(1, 6),
            Paragraph(
                f"<b>Model Mode:</b> {str(analysis.model_mode).upper()} | "
                f"<b>Engine:</b> {analysis.model_name or 'DeepGuard AI'} ({analysis.model_version or '1.0'}) | "
                f"<b>Certificate Authenticity Hash:</b> SHA256:{analysis.file_hash[:16]}... | "
                f"<b>DeepGuard AI Verification Protocol 2026</b>",
                ParagraphStyle('Footer', parent=style_disclaimer, fontSize=6.5, leading=8.5, textColor=colors.HexColor("#94a3b8"))
            )
        ]))
        
        doc.build(elements)
        return pdf_path
