import { CreateReportDto } from '../dto/create-report.dto';

export function generateReportTemplate(dto: CreateReportDto): string {
  const severityColors: Record<string, { bg: string; text: string; label: string }> = {
    low: { bg: '#d4edda', text: '#155724', label: 'BAJA (Low)' },
    medium: { bg: '#fff3cd', text: '#856404', label: 'MEDIA (Medium)' },
    high: { bg: '#f8d7da', text: '#721c24', label: 'ALTA (High)' },
  };

  const severityBadge = severityColors[dto.severity] || {
    bg: '#e2e3e5',
    text: '#383d41',
    label: dto.severity.toUpperCase(),
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo Reporte de Fuga de Agua</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
    <!-- Encabezado -->
    <tr>
      <td style="background-color: #0077b6; padding: 25px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px;">💧 AGUAFIX - MUNICIPIO</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Alerta de Reporte de Fuga de Agua en Vía Pública</p>
      </td>
    </tr>

    <!-- Mensaje Introductorio -->
    <tr>
      <td style="padding: 20px 25px 10px 25px; color: #333333;">
        <p style="margin: 0; font-size: 15px; line-height: 1.5;">
          Estimada <strong>Cuadrilla de Mantenimiento</strong>,<br>
          Se ha recibido un nuevo reporte de fuga de agua a través del sistema ciudadano. A continuación se presentan los detalles para su pronta atención:
        </p>
      </td>
    </tr>

    <!-- Tarjeta de Detalles -->
    <tr>
      <td style="padding: 10px 25px 25px 25px;">
        <table width="100%" cellspacing="0" cellpadding="12" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
          <tr>
            <td width="35%" style="font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0;">📍 Dirección / Referencia:</td>
            <td style="color: #1e293b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">${dto.address}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0;">📝 Descripción:</td>
            <td style="color: #1e293b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">${dto.description}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0;">⚠️ Severidad:</td>
            <td style="border-bottom: 1px solid #e2e8f0;">
              <span style="display: inline-block; padding: 4px 10px; font-size: 12px; font-weight: bold; border-radius: 4px; background-color: ${severityBadge.bg}; color: ${severityBadge.text};">
                ${severityBadge.label}
              </span>
            </td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #475569;">📞 Teléfono de Contacto:</td>
            <td style="color: #1e293b; font-size: 14px; font-weight: bold;">
              <a href="tel:${dto.reporterPhone}" style="color: #0077b6; text-decoration: none;">${dto.reporterPhone}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Pie de página -->
    <tr>
      <td style="background-color: #f1f5f9; padding: 15px 25px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0;">Sistema Automatizado de Reportes - Dirección de Agua Potable y Alcantarillado</p>
        <p style="margin: 5px 0 0 0;">Por favor acuda a verificar y atender este reporte a la brevedad.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
