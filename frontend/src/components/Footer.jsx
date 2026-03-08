const Footer = () => {
  const email = localStorage.getItem("email") || "[your.email@psgtech.ac.in]";
  const body = encodeURIComponent(
    `Dear Admin,\n\n` +
    `I hope this message finds you well. I am reaching out to report an issue encountered on the Event Permission System. The issue is as follows:\n\n` +
    `[Kindly describe the nature of the issue encountered. If applicable, include specific details about the issue.]\n\n` +
    `I would appreciate it if you could look into this matter at your earliest convenience. Please let me know if any additional information is required from my end to assist in resolving the issue.\n\n` +
    `Thank you for your time and support.\n\n` +
    `Best regards,\n${email}`
  );

  const mailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=support@psgtech.ac.in&su=Support%20Request%3A%20Issue%20on%20Event%20Permission%20System&body=${body}`;

  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 bg-[#290001] text-[#DBCBBD] text-center p-3 sm:p-5 text-[11px] sm:text-sm font-medium border-t border-[#C87941]/50">
      <a
        href="https://psgtech.edu/"
        className="text-[#DBCBBD] hover:text-[#C87941] transition-colors duration-200"
        target="_blank"
        rel="noopener noreferrer"
      >
        PSG College of Technology
      </a>
      <span className="mx-2">|</span>
      <a
        href="https://events.psgtech.ac.in"
        className="text-[#DBCBBD] hover:text-[#C87941] transition-colors duration-200"
        target="_blank"
        rel="noopener noreferrer"
      >
        events.psgtech.ac.in
      </a>
      <span className="mx-2">|</span>
      <a
        href={mailUrl}
        className="text-[#DBCBBD] hover:text-[#C87941] transition-colors duration-200"
        target="_blank"
        rel="noopener noreferrer"
      >
        Support
      </a>
    </footer>
  );
};

export default Footer;