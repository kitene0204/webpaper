/**
 * ==============================================================================
 * [우리반 롤링페이퍼] Google Apps Script 백엔드 코드 (Code.gs)
 * ==============================================================================
 * 
 * [배포 방법]
 * 1. 구글 스프레드시트(Google Sheets) 생성
 * 2. 상단 메뉴 [확장 프로그램] -> [Apps Script] 클릭
 * 3. 기본 코드(myFunction)를 지우고, 이 Code.gs 코드를 붙여넣고 저장(Ctrl+S)
 * 4. 왼쪽 [+] 파일 추가 버튼을 눌러 HTML 파일 선택 -> 이름을 'index'로 생성
 * 5. 생성된 index.html에 제공된 index.html 코드를 붙여넣고 저장(Ctrl+S)
 * 6. 오른쪽 상단 [배포] -> [새 배포] 클릭
 *    - 유형: [웹 앱] 선택
 *    - 설명: 우리반 롤링페이퍼 v1.0
 *    - 다음 사용자 권한으로 실행: '나(내 계정)'
 *    - 액세스 권한이 있는 사용자: '모든 사용자(Anyone)' (로그인 없이 누구나 작성 가능)
 * 7. [배포] 클릭 후 승인하고 발급된 URL을 학생들에게 전달하면 끝!
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
 * 웹 앱에 접속했을 때 index.html 화면을 렌더링
 */
function doGet(e) {
  // 외부 REST API로 호출할 경우를 위한 처리
  if (e && e.parameter && e.parameter.action) {
    return handleApiGet(e);
  }

  // GAS 자체 웹 앱 페이지로 접속 시 HTML 반환
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('우리반 롤링페이퍼')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * 외부 POST API 요청 처리 (CORS 대응)
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter || {};
      }
    } else {
      payload = (e && e.parameter) ? e.parameter : {};
    }

    const action = payload.action;

    switch (action) {
      case 'getStudents':
        return jsonResponse({ success: true, students: getStudents() });

      case 'addStudent': {
        const student = addStudent(payload.studentName, payload.gradeClass);
        return jsonResponse({ success: true, student: student, students: getStudents() });
      }

      case 'addStudentsBulk': {
        const result = addStudentsBulk(payload.studentNames, payload.gradeClass);
        return jsonResponse({ success: true, addedCount: result.length, students: getStudents() });
      }

      case 'getMessages':
        return jsonResponse({ success: true, messages: getMessages(payload.studentName) });

      case 'addMessage': {
        const msg = addMessage(payload);
        return jsonResponse({ success: true, message: msg, students: getStudents() });
      }

      case 'deleteMessage': {
        const ok = deleteMessage(payload.studentName, payload.messageId);
        return jsonResponse({ success: ok, messageId: payload.messageId });
      }

      case 'ping':
        return jsonResponse({
          success: true,
          message: '정상 연결되었습니다.',
          spreadsheetName: SpreadsheetApp.getActiveSpreadsheet().getName()
        });

      default:
        return jsonResponse({ success: false, error: '알 수 없는 요청: ' + action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// ------------------------------------------------------------------------------
// GAS 내부 함수 (index.html에서 google.script.run으로 직접 호출 가능)
// ------------------------------------------------------------------------------

/**
 * 전체 학생 시트 목록 조회
 */
function getStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const students = [];

  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    const sheetName = sheet.getName();

    // 관리용 또는 기본 빈 시트 건너뜀
    if (sheetName.startsWith('_') || (sheetName === 'Sheet1' && sheets.length > 1 && sheet.getLastRow() === 0)) {
      continue;
    }

    const lastRow = sheet.getLastRow();
    const messageCount = Math.max(0, lastRow - 1); // 헤더 제외

    students.push({
      id: 'st_' + encodeURIComponent(sheetName),
      name: sheetName,
      messageCount: messageCount,
      lastUpdated: new Date().toISOString()
    });
  }

  // 만약 등록된 학생이 하나도 없다면 기본 샘플 학생 3명 자동 생성
  if (students.length === 0) {
    ['김민준', '이서연', '박도현'].forEach(name => {
      ensureStudentSheet(name);
    });
    return getStudents();
  }

  return students;
}

/**
 * 단일 학생 시트 추가
 */
function addStudent(studentName) {
  const trimmed = (studentName || '').trim();
  if (!trimmed) throw new Error('학생 이름을 입력해주세요.');

  ensureStudentSheet(trimmed);

  return {
    id: 'st_' + encodeURIComponent(trimmed),
    name: trimmed,
    messageCount: 0,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * 여러 학생 일괄 추가
 */
function addStudentsBulk(names) {
  if (!Array.isArray(names)) return [];
  const added = [];

  names.forEach(name => {
    const trimmed = (name || '').trim();
    if (trimmed) {
      ensureStudentSheet(trimmed);
      added.push(trimmed);
    }
  });

  return added;
}

/**
 * 특정 학생의 롤링페이퍼 메시지 목록 조회
 */
function getMessages(studentName) {
  const trimmed = (studentName || '').trim();
  if (!trimmed) return [];

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(trimmed);
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return []; // 데이터 없음

  const values = sheet.getRange(2, 1, lastRow - 1, HEADER_COLUMNS.length).getValues();
  const messages = [];

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    messages.push({
      id: String(row[7] || ('msg_' + i)),
      studentName: trimmed,
      createdAt: row[0] instanceof Date ? Utilities.formatDate(row[0], 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss') : String(row[0] || ''),
      author: String(row[1] || '익명의 친구'),
      content: String(row[2] || ''),
      sticker: String(row[3] || '💌'),
      color: String(row[4] || 'butter'),
      font: String(row[5] || 'himelody'),
      isSecret: Boolean(row[6] === true || String(row[6]).toLowerCase() === 'true'),
      rotation: ((i % 5) - 2) * 1.5
    });
  }

  // 최신순으로 정렬 (역순)
  return messages.reverse();
}

/**
 * 특정 학생의 시트에 새 메시지 행 추가
 */
function addMessage(data) {
  const studentName = (data.studentName || '').trim();
  if (!studentName) throw new Error('받는 친구의 이름을 입력해주세요.');

  ensureStudentSheet(studentName);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(studentName);

  const msgId = data.id || ('msg_' + new Date().getTime() + '_' + Math.random().toString(36).substring(2, 6));
  const dateStr = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
  const author = (data.author || '익명의 친구').trim();
  const content = String(data.content || '').trim();
  const sticker = data.sticker || '💌';
  const color = data.color || 'butter';
  const font = data.font || 'himelody';
  const isSecret = Boolean(data.isSecret);

  const rowValues = [
    dateStr,
    author,
    content,
    sticker,
    color,
    font,
    isSecret,
    msgId
  ];

  sheet.appendRow(rowValues);
  const newRowIdx = sheet.getLastRow();

  // 셀 서식 지정 (가운데 정렬, 줄바꿈 허용)
  sheet.setRowHeight(newRowIdx, 32);
  const rowRange = sheet.getRange(newRowIdx, 1, 1, HEADER_COLUMNS.length);
  rowRange.setVerticalAlignment('middle');

  return {
    id: msgId,
    studentName: studentName,
    createdAt: dateStr,
    author: author,
    content: content,
    sticker: sticker,
    color: color,
    font: font,
    isSecret: isSecret,
    rotation: Math.floor(Math.random() * 7) - 3
  };
}

/**
 * 특정 학생의 메시지 삭제
 */
function deleteMessage(studentName, messageId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(studentName);
  if (!sheet) return false;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  const ids = sheet.getRange(2, 8, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(messageId)) {
      sheet.deleteRow(i + 2);
      return true;
    }
  }
  return false;
}

/**
 * 특정 학생 시트가 없으면 생성하고 예쁜 헤더 적용
 */
function ensureStudentSheet(studentName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(studentName);

  if (!sheet) {
    sheet = ss.insertSheet(studentName);

    // 헤더 행 작성
    sheet.getRange(1, 1, 1, HEADER_COLUMNS.length).setValues([HEADER_COLUMNS]);

    // 헤더 행 스타일링 (부드러운 코랄-피치 톤 배경)
    const headerRange = sheet.getRange(1, 1, 1, HEADER_COLUMNS.length);
    headerRange.setBackground('#FFF6A9'); // 포근한 버터 옐로우
    headerRange.setFontColor('#5c4a16');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');

    sheet.setRowHeight(1, 38);
    sheet.setFrozenRows(1);

    // 열 너비 조정
    sheet.setColumnWidth(1, 160); // 작성일시
    sheet.setColumnWidth(2, 130); // 작성자
    sheet.setColumnWidth(3, 380); // 메시지 내용
    sheet.setColumnWidth(4, 70);  // 스티커
    sheet.setColumnWidth(5, 100); // 색상
    sheet.setColumnWidth(6, 110); // 글꼴
    sheet.setColumnWidth(7, 90);  // 비밀글 여부
    sheet.setColumnWidth(8, 140); // 메시지 ID

    // 기본 빈 시트(Sheet1)가 있으면 정리
    const defaultSheet = ss.getSheetByName('Sheet1');
    if (defaultSheet && defaultSheet.getLastRow() === 0 && ss.getSheets().length > 1) {
      try {
        ss.deleteSheet(defaultSheet);
      } catch (e) {}
    }
  }

  return sheet;
}

/**
 * 외부 GET API 지원
 */
function handleApiGet(e) {
  const action = e.parameter.action;
  if (action === 'getStudents') {
    return jsonResponse({ success: true, students: getStudents() });
  }
  if (action === 'getMessages') {
    return jsonResponse({ success: true, messages: getMessages(e.parameter.student) });
  }
  return jsonResponse({ success: false, error: 'Unknown action' });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
