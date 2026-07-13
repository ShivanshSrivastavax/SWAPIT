export const logoHtml = 
`<div style="margin-bottom:32px; text-align:center;">
     <img src="cid:swapit-logo" alt="SwapIt logo" style="max-width:240px; height:auto; display:block; margin:0 auto;" />
     </div> `;

export const footerHtml = `
<div style="background:#f7f7f7;padding:24px 30px;text-align:center;">

<p style="margin:0;font-size:13px;font-weight:bold;color:#555;">
SwapIt
</p>

<p style="margin:8px 0 0;font-size:12px;color:#777;line-height:20px;">
Create games • Join friends • Play smart
</p>

<p style="margin:18px 0 0;font-size:11px;color:#999;">
This email was sent because you created a SwapIt account.
If this wasn't you, you can safely ignore this email.
</p>

</div>
`;



const registrationSuccessTemplate = (name, loginUrl) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Welcome to SwapIt</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:48px 15px;">
<tr>
<td align="center">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">

<tr>
<td style="background:#2f6fed;height:8px;font-size:0;">&nbsp;</td>
</tr>

<tr>
<td align="center" style="padding:36px 40px 10px;">

${logoHtml}

</td>
</tr>

<tr>
<td align="center" style="padding:10px 40px 0;">

<h1 style="margin:0 0 10px;font-size:26px;color:#1a1a1a;font-weight:bold;">
You're in, ${name}!
</h1>

<p style="margin:0 auto;max-width:420px;font-size:15px;line-height:24px;color:#666666;">
Welcome to SwapIt. Match colors, stack action cards, and race your friends to zero.
</p>

</td>
</tr>

<tr>
<td align="center" style="padding:30px 40px 20px;">

<a href="${loginUrl}"
style="background:#f5b800;
color:#1a1a1a;
text-decoration:none;
padding:14px 36px;
border-radius:10px;
display:inline-block;
font-weight:bold;
font-size:15px;">
Play your first round
</a>

</td>
</tr>

<tr>
<td align="center" style="padding:20px 40px 35px;">

<table role="presentation" cellpadding="0" cellspacing="0">
<tr>

<td align="center" style="padding:0 12px;">
<div style="width:14px;height:14px;background:#2f6fed;border-radius:4px;margin:0 auto 6px;"></div>
<div style="font-size:11px;color:#888;">Create</div>
</td>

<td align="center" style="padding:0 12px;">
<div style="width:14px;height:14px;background:#1f9d55;border-radius:4px;margin:0 auto 6px;"></div>
<div style="font-size:11px;color:#888;">Join</div>
</td>

<td align="center" style="padding:0 12px;">
<div style="width:14px;height:14px;background:#e8384f;border-radius:4px;margin:0 auto 6px;"></div>
<div style="font-size:11px;color:#888;">Compete</div>
</td>

</tr>
</table>

</td>
</tr>

<tr>
<td>

${footerHtml}

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

export default registrationSuccessTemplate;