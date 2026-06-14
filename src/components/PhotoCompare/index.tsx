import { Image } from 'antd';
import EmptyState from '../EmptyState';

interface PhotoCompareProps {
  beforePhotos: string[];
  afterPhotos: string[];
}

function PhotoColumn({
  title,
  photos,
  borderColor,
  titleBg,
}: {
  title: string;
  photos: string[];
  borderColor: string;
  titleBg: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        border: `1px solid ${borderColor}40`,
        borderRadius: 12,
        overflow: 'hidden',
        background: '#fff',
        minHeight: 200,
      }}
    >
      <div
        style={{
          padding: '12px 20px',
          background: titleBg,
          borderBottom: `1px solid ${borderColor}20`,
          fontSize: 14,
          fontWeight: 600,
          color: borderColor,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: borderColor,
          }}
        />
        {title}
        <span style={{ color: '#999', fontSize: 12, fontWeight: 400, marginLeft: 'auto' }}>
          共 {photos.length} 张
        </span>
      </div>
      <div style={{ padding: 16 }}>
        {photos.length > 0 ? (
          <Image.PreviewGroup items={photos}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: 12,
              }}
            >
              {photos.map((url, index) => (
                <div
                  key={index}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Image
                    src={url}
                    alt={`${title}-${index + 1}`}
                    width="100%"
                    height="100%"
                    style={{ objectFit: 'cover' }}
                    preview={{
                      mask: '点击查看大图',
                    }}
                  />
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        ) : (
          <EmptyState title="暂无照片" />
        )}
      </div>
    </div>
  );
}

export default function PhotoCompare({ beforePhotos, afterPhotos }: PhotoCompareProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
      }}
    >
      <PhotoColumn
        title="维修前"
        photos={beforePhotos}
        borderColor="#E63946"
        titleBg="rgba(230, 57, 70, 0.08)"
      />
      <PhotoColumn
        title="维修后"
        photos={afterPhotos}
        borderColor="#2A9D8F"
        titleBg="rgba(42, 157, 143, 0.08)"
      />
    </div>
  );
}
