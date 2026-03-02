export async function extractFramesFromVideo(videoFile: File, frameCount: number = 5): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: string[] = [];
    const url = URL.createObjectURL(videoFile);

    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    video.onloadedmetadata = async () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const duration = video.duration;
      const interval = duration / (frameCount + 1);

      try {
        for (let i = 1; i <= frameCount; i++) {
          video.currentTime = interval * i;
          await new Promise(r => { video.onseeked = r; });
          
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Reduzir qualidade para não estourar payload
            frames.push(canvas.toDataURL('image/jpeg', 0.7)); 
          }
        }
        URL.revokeObjectURL(url);
        resolve(frames);
      } catch (e) {
        reject(e);
      }
    };

    video.onerror = (e) => {
      reject(e);
    };
  });
}
