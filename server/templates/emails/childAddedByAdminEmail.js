const childAddedByAdminEmailTemplate = (firstName, lastName, email, password) => `
  <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #b5e2ec 0%, #d687b9 100%); padding: 40px 20px; border-radius: 15px;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #9e63a9; margin: 0; font-size: 28px;">ברוכים הבאים ליד למיוחד!</h1>
        <p style="color: #87c8d2; font-size: 16px; margin-top: 10px;">נוספת לאתר על ידי המנהל</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #b5e2ec 0%, #87c8d2 100%); padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #333; font-size: 16px; margin: 0; text-align: center;">
          שלום וברכה ${firstName} ${lastName},
        </p>
      </div>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #333; font-size: 16px; margin: 0 0 15px 0; line-height: 1.8;">
          נוספת על ידי המנהל לאתר יד למיוחד!<br/>
          ניתן כעת להיכנס לאזור האישי שלך ולהנות מכל השירותים והפעילויות.
        </p>
      </div>
      
      <div style="background-color: #fff5f8; border-right: 4px solid #d687b9; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p style="color: #666; font-size: 14px; margin: 0 0 20px 0; font-weight: bold;">
          🔐 פרטי ההתחברות שלך:
        </p>
        
        <div style="margin-bottom: 15px;">
          <p style="color: #666; font-size: 14px; margin: 0 0 8px 0; font-weight: bold;">
            שם משתמש:
          </p>
          <div style="background-color: white; padding: 12px 15px; border-radius: 5px;">
            <p style="color: #9e63a9; font-size: 16px; font-weight: bold; margin: 0;">
              ${email}
            </p>
          </div>
        </div>
        
        <div>
          <p style="color: #666; font-size: 14px; margin: 0 0 8px 0; font-weight: bold;">
            סיסמה:
          </p>
          <div style="background-color: white; padding: 12px 15px; border-radius: 5px;">
            <p style="color: #9e63a9; font-size: 20px; font-weight: bold; margin: 0; letter-spacing: 2px; font-family: monospace;">
              ${password}
            </p>
          </div>
        </div>
      </div>
      
      <div style="background-color: #fff5f8; border-right: 4px solid #87c8d2; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.6;">
          ⚠️ <strong>חשוב לשמור על הסיסמה במקום בטוח</strong><br/>
          💡 מומלץ לשנות את הסיסמה הראשונית לאחר הכניסה הראשונה<br/>
          🔒 אל תשתף את הסיסמה עם אף אחד
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

module.exports = childAddedByAdminEmailTemplate;
