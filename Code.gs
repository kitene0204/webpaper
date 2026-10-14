/**
 * @file Code.gs
 * @description 우리반 롤링페이퍼 - 구글 앱스 스크립트 (Google Apps Script) 백엔드 코드
 * 
 * [설치 및 배포 가이드]
 * 1. 구글 스프레드시트(Google Sheets)를 새로 만듭니다. (예: "우리반 롤링페이퍼 2026")
 * 2. 상단 메뉴에서 [확장 프로그램] -> [Apps Script]를 클릭합니다.
 * 3. 기존의 myFunction 코드를 모두 지우고, 이 Code.gs 내용 전체를 복사하여 붙여넣습니다.
 * 4. 오른쪽 상단의 [배포] -> [새 배포]를 클릭합니다.
 * 5. 톱니바퀴 아이콘 -> [웹 앱] 선택
 *    - 설명: 우리반 롤링페이퍼 API v1
 *    - 다음 사용자 권한으로 실행: '나(내 계정)'
 *    - 액세스 권한이 있는 사용자: '모든 사용자(Anyone)' (중요! 학생들이 로그인 없이 작성할 수 있게 함)
 * 6. [배포] 버튼을 누르고 권한을 승인합니다.
 * 7. 생성된 [웹 앱 URL]을 복사하여 롤링페이퍼 웹앱의 설정창에 붙여넣으면 연동 완료!
 */

const CONFIG_SHEET_NAME = '_ROLLING_CONFIG_';
const HEADER_COLUMNS = [
  '작성일시',
  '작성자(이름/별명)',
  '메시지 내용',
  '스티커',
  '메모지 색상',
  '글꼴',
  '비밀글 여부',
  '메시지 ID'
];

/**
 * GET 요청 핸들러 (연결 테스트 및 데이터 조회 지원)
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'info';
    
    if (action === 'getStudents') {
      return jsonResponse({ success: true, students: getStudentList() });
    }
    
    if (action === 'getMessages') {
      const studentName = e.parameter.student;
      if (!studentName) {
        return jsonResponse({ success: false, error: '학생 이름이 누락되었습니다.' });
      }
      return jsonResponse({ success: true, messages: getStudentMessages(studentName) });
    }

    // 기본 웹페이지 응답 (웹 앱 URL 직접 접속 시 안내 화면)
    return HtmlService.createHtmlOutput(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>우리반 롤링페이퍼 API 서버</title>
        <style>
          body { font-family: -apple-system, sans-serif; padding: 40px; line-height: 1.6; background: #f8fafc; color: #1e293b; }
          .card { background: white; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          h1 { color: #2563eb; margin-top: 0; }
          .status { display: inline-block; padding: 6px 12px; background: #dcfce7; color: #15803d; border-radius: 9999px; font-weight: bold; font-size: 14px; }
          code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="status">● 서버 정상 작동 중</span>
          <h1>우리반 롤링페이퍼 API</h1>
          <p>이 웹 앱은 롤링페이퍼 웹 클라이언트와 구글 스프레드시트를 안전하게 연결해 주는 백엔드입니다.</p>
          <p><strong>연동된 스프레드시트:</strong> ${SpreadsheetApp.getActiveSpreadsheet().getName()}</p>
          <p>웹 앱 주소를 롤링페이퍼 웹 설정창의 <code>Google Apps Script URL</code>에 입력하여 연동하세요!</p>
        </div>
      </body>
      </html>
    `).setTitle('우리반 롤링페이퍼 API');

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * POST 요청 핸들러 (학생 추가, 메시지 작성, 메시지 삭제, 일괄 동기화)
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        // 혹시 form-urlencoded 등으로 전송된 경우 처리
        payload = e.parameter || {};
      }
    } else {
      payload = (e && e.parameter) ? e.parameter : {};
    }

    const action = payload.action;

    switch (action) {
      case 'getStudents': {
        const students = getStudentList();
        return jsonResponse({ success: true, students: students });
      }

      case 'addStudent': {
        const studentName = (payload.studentName || '').trim();
        if (!studentName) {
          return jsonResponse({ success: false, error: '학생 이름이 비어있습니다.' });
        }
        const created = ensureStudentSheet(studentName);
        return jsonResponse({ 
          success: true, 
          message: created ? '학생 시트가 생성되었습니다.' : '이미 존재하는 학생입니다.',
          students: getStudentList() 
        });
      }

      case 'addStudentsBulk': {
        const names = payload.studentNames || [];
        const results = [];
        names.forEach(name => {
          const trimmed = (name || '').trim();
          if (trimmed) {
            ensureStudentSheet(trimmed);
            results.push(trimmed);
          }
        });
        return jsonResponse({ success: true, addedCount: results.length, students: getStudentList() });
      }

      case 'getMessages': {
        const studentName = payload.studentName;
        if (!studentName) {
          return jsonResponse({ success: false, error: '학생 이름이 필요합니다.' });
        }
        const messages = getStudentMessages(studentName);
        return jsonResponse({ success: true, messages: messages });
      }

      case 'addMessage': {
        const studentName = (payload.studentName || '').trim();
        if (!studentName) {
          return jsonResponse({ success: false, error: '대상 학생 이름이 필요합니다.' });
        }

        const messageData = {
          id: payload.id || ('msg_' + new Date().getTime() + '_' + Math.random().toString(36).substring(2, 6)),
          author: payload.author || '익명의 친구',
          content: payload.content || '',
          sticker: payload.sticker || '💌',
          color: payload.color || 'butter',
          font: payload.font || 'himelody',
          isSecret: payload.isSecret ? true : false,
          createdAt: payload.createdAt || new Date().toISOString()
        };

        const result = appendMessageToStudent(studentName, messageData);
        return jsonResponse({ success: true, message: result, students: getStudentList() });
      }

      case 'deleteMessage': {
        const studentName = payload.studentName;
        const messageId = payload.messageId;
        const deleted = deleteStudentMessage(studentName, messageId);
        return jsonResponse({ success: deleted, messageId: messageId });
      }

      case 'ping':
        return jsonResponse({ 
          success: true, 
          message: '연결 성공!', 
          spreadsheetName: SpreadsheetApp.getActiveSpreadsheet().getName(),
          serverTime: new Date().toISOString() 
        });

      default:
        return jsonResponse({ success: false, error: '알 수 없는 action: ' + action });
    }

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString(), stack: err.stack });
  }
}

/**
 * 학생 시트 목록 조회 (설정 시트 제외)
 */
function getStudentList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const students = [];

  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    const sheetName = sheet.getName();

    // 내부 관리용 시트는 건너뜀
    if (sheetName.startsWith('_') || sheetName === 'Sheet1' && sheets.length > 1) {
      continue;
    }

    const lastRow = sheet.getLastRow();
    const messageCount = Math.max(0, lastRow - 1); // 헤더 1줄 제외

    students.push({
      id: 'student_' + encodeURIComponent(sheetName),
      name: sheetName,
      messageCount: messageCount,
      lastUpdated: new Date().toISOString()
    });
  }

  return students;
}

/**
 * 특정 학생 시트가 없으면 생성하고 헤더를 예쁘게 포맷팅
 */
function ensureStudentSheet(studentName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(studentName);
  let isCreated = false;

  if (!sheet) {
    sheet = ss.insertSheet(studentName);
    isCreated = true;

    // 헤더 행 작성
    sheet.getRange(1, 1, 1, HEADER_COLUMNS.length).setValues([HEADER_COLUMNS]);

    // 헤더 서식 지정 (선명한 파스텔 블루, 볼드, 가운데 정렬)
    const headerRange = sheet.getRange(1, 1, 1, HEADER_COLUMNS.length);
    headerRange.setBackground('#e0f2fe');
    headerRange.setFontColor('#0369a1');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');

    sheet.setRowHeight(1, 36);
    sheet.setFrozenRows(1);

    // 열 너비 조정
    sheet.setColumnWidth(1, 180); // 작성일시
    sheet.setColumnWidth(2, 130); // 작성자
    sheet.setColumnWidth(3, 350); // 메시지 내용
    sheet.setColumnWidth(4, 80);  // 스티커
    sheet.setColumnWidth(5, 100); // 메모지 색상
    sheet.setColumnWidth(6, 90);  // 글꼴
    sheet.setColumnWidth(7, 90);  // 비밀글 여부
    sheet.setColumnWidth(8, 140); // 메시지 ID

    // 기본 시트(Sheet1)가 비어있다면 정리
    const defaultSheet = ss.getSheetByName('Sheet1');
    if (defaultSheet && defaultSheet.getLastRow() === 0 && ss.getSheets().length > 1) {
      try {
        ss.deleteSheet(defaultSheet);
      } catch (e) {
        // 무시
      }
    }
  }

  return isCreated;
}

/**
 * 특정 학생의 모든 롤링페이퍼 메시지 읽기
 */
function getStudentMessages(studentName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(studentName);
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return []; // 헤더뿐이거나 비어있음

  const values = sheet.getRange(2, 1, lastRow - 1, HEADER_COLUMNS.length).getValues();
  const messages = [];

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    messages.push({
      id: row[7] || ('msg_' + i),
      studentName: studentName,
      createdAt: row[0] instanceof Date ? row[0].toISOString() : String(row[0] || ''),
      author: String(row[1] || '익명의 친구'),
      content: String(row[2] || ''),
      sticker: String(row[3] || '💌'),
      color: String(row[4] || 'yellow'),
      font: String(row[5] || 'gaegu'),
      isSecret: Boolean(row[6] === true || String(row[6]).toLowerCase() === 'true')
    });
  }

  return messages;
}

/**
 * 특정 학생의 시트에 새 메시지 행 추가
 */
function appendMessageToStudent(studentName, msg) {
  ensureStudentSheet(studentName);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(studentName);

  const formattedDate = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

  const rowData = [
    formattedDate,
    msg.author,
    msg.content,
    msg.sticker,
    msg.color,
    msg.font,
    msg.isSecret ? true : false,
    msg.id
  ];

  sheet.appendRow(rowData);
  const newRowIndex = sheet.getLastRow();
  
  // 새로 추가된 행 높이 및 정렬
  sheet.setRowHeight(newRowIndex, 30);
  const rowRange = sheet.getRange(newRowIndex, 1, 1, HEADER_COLUMNS.length);
  rowRange.setVerticalAlignment('middle');

  return {
    id: msg.id,
    studentName: studentName,
    author: msg.author,
    content: msg.content,
    sticker: msg.sticker,
    color: msg.color,
    font: msg.font,
    isSecret: msg.isSecret,
    createdAt: formattedDate
  };
}

/**
 * 특정 학생의 메시지 행 삭제
 */
function deleteStudentMessage(studentName, messageId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(studentName);
  if (!sheet) return false;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  const idValues = sheet.getRange(2, 8, lastRow - 1, 1).getValues();
  for (let i = 0; i < idValues.length; i++) {
    if (String(idValues[i][0]) === String(messageId)) {
      sheet.deleteRow(i + 2);
      return true;
    }
  }

  return false;
}

/**
 * CORS 지원 JSON 응답 유틸리티
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
