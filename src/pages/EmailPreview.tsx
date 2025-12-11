// Temporary preview page - delete after reviewing
const ctaButton = `
  <div style="text-align: center; margin: 24px 0;">
    <a href="https://onehello.io" style="display: inline-block; background-color: #ff6f3b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Open One Hello</a>
  </div>
`;

const day1Template = `
  <h2>Day 1 is live 👋</h2>
  <p>Your first challenge: <strong>Say hello to a stranger today.</strong></p>
  <p>It can be anyone — a barista, someone in the elevator, a person walking by. Just a simple "Hi" or "Hello" is all it takes.</p>
  <p>Once you've done it, open the app and log your hello. You can add their name if you caught it, and any notes you want to remember.</p>
  <p>Complete this and earn your first Orb 🔮</p>
  ${ctaButton}
  <p>You've got this!<br/>— Remi 🦝</p>
`;

const dailyReminderTemplate = `
  <h2>Quick check-in!</h2>
  <p>Just a friendly nudge — have you logged your hello today?</p>
  <p>One hello a day keeps your streak alive. If life gets in the way, you can always use an Orb to save it 🔮</p>
  ${ctaButton}
  <p>— Remi 🦝</p>
`;

const EmailPreview = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Email Template Preview</h1>
      
      <div className="max-w-xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-800 text-white px-4 py-2 text-sm">
            Day 1 Onboarding Email
          </div>
          <div 
            className="p-6"
            style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}
            dangerouslySetInnerHTML={{ __html: day1Template }}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-800 text-white px-4 py-2 text-sm">
            Daily Path Reminder
          </div>
          <div 
            className="p-6"
            style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}
            dangerouslySetInnerHTML={{ __html: dailyReminderTemplate }}
          />
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;
