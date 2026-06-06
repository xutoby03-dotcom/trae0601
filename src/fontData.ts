// ============================================================================
// 中文字体配置 - PDF导出使用
// ============================================================================
// jsPDF 默认字体不支持中文，需要手动添加中文字体的 base64 编码
// 
// 使用步骤：
// 1. 下载 Noto Sans SC Regular 字体 (思源黑体，开源免费):
//    官方地址: https://fonts.google.com/noto/specimen/Noto+Sans+SC
//    直接下载: https://fonts.gstatic.com/s/notosanssc/v37/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_E2w.ttf
// 
// 2. 将下载的 .ttf 字体文件转换为 base64 编码:
//    在线工具: https://www.base64encoder.io/base64-file-encoder/
//    或命令行: base64 -i NotoSansSC-Regular.ttf -o notosans.txt
// 
// 3. 将得到的完整 base64 字符串粘贴到下方 NOTO_SANS_SC_BASE64 变量中
//    注意: 不要加引号，不要换行（或用模板字符串包裹）
// 
// 4. 保存后重新运行项目，导出 PDF 即可正常显示中文
// ============================================================================
// 完整字体约 6-8MB base64，属于正常大小
// 如果觉得字体太大，可以使用 fontmin 等工具只提取常用汉字子集
// ============================================================================

export const NOTO_SANS_SC_BASE64: string = '';
