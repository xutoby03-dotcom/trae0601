import { EmojiCanvas } from '../components/Canvas/EmojiCanvas';
import { EmojiPicker } from '../components/EmojiPicker/EmojiPicker';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { TemplateGallery } from '../components/TemplateGallery/TemplateGallery';

export const Editor = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">
          <div className="flex-shrink-0">
            <EmojiPicker />
          </div>
          
          <div className="flex-1 flex flex-col items-center">
            <EmojiCanvas />
          </div>
          
          <div className="flex-shrink-0 w-72 space-y-4">
            <Toolbar />
            <TemplateGallery />
          </div>
        </div>
      </div>
    </div>
  );
};
