function ClassReportTemplate({ className, term, students, viewType, subjectName }) {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Ikonex Academy</h2>
        <p style={{ fontSize: '16px' }}>Class Performance Report</p>
        <hr style={{ margin: '10px 0' }} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Class:</strong> {className}</p>
        <p><strong>Term:</strong> {term}</p>
        {viewType === 'subject' && <p><strong>Subject:</strong> {subjectName}</p>}
        {viewType === 'overall' && <p><strong>Report Type:</strong> Overall Class Ranking</p>}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Position</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Admission No</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Student Name</th>
            {viewType === 'subject' ? (
              <>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Exam</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Continuous</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Total</th>
              </>
            ) : (
              <>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Total Marks</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Average</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {students.map((student, idx) => (
            <tr key={idx}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{student.position}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{student.admission_no}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{student.student_name}</td>
              {viewType === 'subject' ? (
                <>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{student.exam_score}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{student.continuous_score}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{student.total_score}</td>
                </>
              ) : (
                <>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{student.total_marks}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{student.average}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
        Generated on {new Date().toLocaleDateString()} – Ikonex Academy
      </div>
    </div>
  );
}

export default ClassReportTemplate;