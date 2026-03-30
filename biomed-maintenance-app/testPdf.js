const { jsPDF } = require('jspdf');

const doc = new jsPDF();
doc.setFont('helvetica', 'normal');
doc.text('Checkmark test: ✓ ✔ v', 10, 10);
doc.save('test_check.pdf');
console.log('Saved test_check.pdf');
