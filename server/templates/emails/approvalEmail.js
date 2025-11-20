const approvalEmailTemplate = (firstName, lastName, password) => `
  <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #b5e2ec 0%, #d687b9 100%); padding: 40px 20px; border-radius: 15px;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #9e63a9; margin: 0; font-size: 28px;">ברוכים הבאים ליד למיוחד</h1>
        <p style="color: #87c8d2; font-size: 16px; margin-top: 10px;">חשבונך אושר בהצלחה!</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #b5e2ec 0%, #87c8d2 100%); padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #333; font-size: 16px; margin: 0 0 15px 0; text-align: center;">
          שלום ${firstName} ${lastName},
        </p>
        <p style="color: #333; font-size: 16px; margin: 0; text-align: center;">
          חשבונך אושר על ידי המנהל!<br/>
          להלן הסיסמה הראשונית שלך להתחברות:
        </p>
      </div>
      
      <div style="background-color: #f8f9fa; border: 2px dashed #9e63a9; padding: 25px; border-radius: 10px; text-align: center; margin: 25px 0;">
        <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">הסיסמה שלך:</p>
        <h2 style="color: #9e63a9; font-size: 32px; margin: 0; font-weight: bold;">${password}</h2>
      </div>
      
      <div style="background-color: #fff5f8; border-right: 4px solid #d687b9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.6;">
          🔑 מומלץ לשנות את הסיסמה לאחר ההתחברות הראשונה<br/>
          🔒 שמור על הסיסמה במקום בטוח
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
        <p style="color: #999; font-size: 13px; margin: 0;">
          בברכה,<br/>
          <strong style="color: #9e63a9;">צוות יד למיוחד</strong>
        </p>
      </div>
    </div>
  </div>
`;

module.exports = approvalEmailTemplate;
