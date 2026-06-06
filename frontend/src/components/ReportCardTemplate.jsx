function ReportCardTemplate({ student, performance }) {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Ikonex Academy</h2>
        <p style={{ fontSize: '16px' }}>Student Report Card</p>
        <hr style={{ margin: '10px 0' }} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Student Name:</strong> {student.name}</p>
        <p><strong>Admission No:</strong> {student.admission_no}</p>
        <p><strong>Stream:</strong> {student.stream_name || 'Not Assigned'}</p>
        <p><strong>Term:</strong> {performance.term}</p>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Subject</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Exam</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Continuous</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Total</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Position</th>
          </tr>
        </thead>
        <tbody>
          {performance.subjects.map((sub, idx) => (
            <tr key={idx}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{sub.subject_name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{sub.exam_score ?? '-'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{sub.continuous_score ?? '-'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{sub.total_score ?? '-'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{sub.position ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '20px' }}>
        <p><strong>Total Marks:</strong> {performance.total_marks}</p>
        <p><strong>Average Score:</strong> {performance.average_score}</p>
        <p><strong>Grade:</strong> {performance.grade}</p>
        <p><strong>Remark:</strong> {performance.remark}</p>
        <p><strong>Class Position:</strong> {performance.overall_position || 'N/A'}</p>
      </div>
      <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
        Generated on {new Date().toLocaleDateString()} – Ikonex Academy
      </div>
    </div>
  );
}

export default ReportCardTemplate;