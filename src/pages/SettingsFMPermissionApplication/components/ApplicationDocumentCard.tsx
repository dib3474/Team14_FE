import Button from '@/components/common/Button';
import PickIcon from '@/components/common/PickIcon';
import { PICK_ICONS } from '@/constants/pickIcons';

interface ApplicationDocumentCardProps {
  documents: { id: number; presignedUrl: string; fileName: string }[];
  setDocuments: (documents: { id: number; presignedUrl: string; fileName: string }[]) => void;
  handleFileUpload: () => void;
  isUploading: boolean;
}
/**
 * 축제 관리자 승급 신청자를 위한 증빙 서류 업로드 카드
 * @param documents - 업로드된 서류 목록
 * @param setDocuments - 서류 목록을 설정하는 함수
 * @param handleFileUpload - 서류 업로드 함수
 * @param isUploading - 서류 업로드 상태
 * @returns 카드 컴포넌트
 */
const ApplicationDocumentCard = ({
  documents,
  setDocuments,
  handleFileUpload,
  isUploading,
}: ApplicationDocumentCardProps) => {
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <PickIcon name={PICK_ICONS.DOCUMENT} size={20} />;
      case 'doc':
      case 'docx':
        return <PickIcon name={PICK_ICONS.BOOK_BLUE} size={20} />;
      case 'hwp':
        return <PickIcon name={PICK_ICONS.BOOK_GREEN} size={20} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <PickIcon name={PICK_ICONS.IMAGE} size={20} />;
      default:
        return <PickIcon name={PICK_ICONS.CLIP} size={20} />;
    }
  };

  return (
    <>
      {/* 증빙 서류 업로드 */}
      <div className="mb-4">
        <h2 className="text-base font-bold mb-3 text-ui-ink">
          증빙 서류 업로드 <span className="text-red-500">*</span>
        </h2>
        <p className="ui-body text-ui-muted mb-3">
          축제 관리자로 활동할 수 있는 자격을 증명할 수 있는 서류를 업로드해주세요.
          <br />
          (예: 재직증명서, 소속 증명서, 자격증, 경력 증명서 등)
        </p>

        <Button
          variant="secondary"
          className="w-full h-auto min-h-12 whitespace-normal text-left leading-relaxed"
          onClick={handleFileUpload}
          disabled={isUploading}
        >
          <PickIcon name={PICK_ICONS.CLIP} size={20} className="mr-2" />
          증빙 서류 업로드 (PDF, 이미지, 문서 파일)
        </Button>
        <p className="text-xs leading-relaxed text-ui-muted mt-1">
          지원 형식: PDF, DOC, DOCX, HWP, 이미지 (최대 10MB/파일)
        </p>
      </div>

      {/* 업로드된 파일 목록 */}
      {documents.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-ui-ink mb-2">
            업로드된 서류 ({documents.length}개)
          </h4>
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="ui-inset flex items-center justify-between gap-2 border border-ui-line"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xl">{getFileIcon(doc.fileName)}</span>
                  <span className="text-sm text-ui-ink [overflow-wrap:anywhere]">
                    {doc.fileName}
                  </span>
                </div>
                <button
                  onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                  className="shrink-0 min-h-11 min-w-11 px-2 py-1 text-red-700 hover:bg-red-50 rounded-lg text-sm"
                  aria-label="파일 삭제"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ApplicationDocumentCard;
