import ffmpeg
import os

class VideoProcessor:
    @staticmethod
    def process(input_path: str, output_path: str, tool: str):
        stream = ffmpeg.input(input_path)
        
        if tool == "compress":
            stream = ffmpeg.output(stream, output_path, vcodec='libx264', crf=28)
        
        elif tool == "upscale":
            stream = ffmpeg.output(stream, output_path, vf='scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2')
        
        elif tool == "sharpen":
            stream = ffmpeg.output(stream, output_path, vf='unsharp=5:5:1.0:5:5:0.0')
        
        elif tool == "brightness":
            stream = ffmpeg.output(stream, output_path, vf='eq=brightness=0.2')
        
        elif tool == "contrast":
            stream = ffmpeg.output(stream, output_path, vf='eq=contrast=1.5')
        
        elif tool == "saturation":
            stream = ffmpeg.output(stream, output_path, vf='eq=saturation=1.5')
        
        elif tool == "fps":
            stream = ffmpeg.output(stream, output_path, r=60)
        
        elif tool == "trim":
            # Trim first 10 seconds as a default
            stream = ffmpeg.output(stream, output_path, ss=0, t=10)
        
        elif tool == "rotate":
            stream = ffmpeg.output(stream, output_path, vf='transpose=1') # 90 degrees clockwise
        
        elif tool == "crop":
            stream = ffmpeg.output(stream, output_path, vf='crop=in_w/2:in_h/2:in_w/4:in_h/4')
        
        elif tool == "gif":
            output_path = os.path.splitext(output_path)[0] + ".gif"
            stream = ffmpeg.output(stream, output_path, vf='fps=10,scale=480:-1:flags=lanczos')
        
        elif tool == "extract_audio":
            output_path = os.path.splitext(output_path)[0] + ".mp3"
            stream = ffmpeg.output(stream, output_path, acodec='libmp3lame')
        
        elif tool == "remove_audio":
            stream = ffmpeg.output(stream, output_path, an=None)
        
        else:
            stream = ffmpeg.output(stream, output_path)

        # Overwrite output if exists
        ffmpeg.run(stream, overwrite_output=True)
        return output_path

video_processor = VideoProcessor()
