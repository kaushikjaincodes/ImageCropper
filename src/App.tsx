import ImageCropperContainer from '@/components/ImageCropperContainer';
import { Toaster } from './components/ui/toaster';
function App() {
  return (
    <>
    <Toaster />
      <ImageCropperContainer 
      initialShape="square"
      initialWidth={200}
      initialHeight={200}
      maxSizeMB={2}
      borderRadius={4}
      />
    </>
  )
}

export default App
