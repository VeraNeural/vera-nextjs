# 🎵 Adding Your Freesound Audio Files

## Where to Put Files

Place your downloaded audio files in: `public/sounds/`

## Required Files (rename your downloads to match):

```
public/sounds/
  ├── rain.mp3       (gentle rain sounds)
  ├── ocean.mp3      (ocean waves)
  ├── forest.mp3     (forest birds/nature)
  ├── wind.mp3       (gentle wind)
  ├── fire.mp3       (crackling fire)
  └── night.mp3      (night ambience)
```

## How to Add Them

### Option 1: Drag & Drop (Windows)
1. Open File Explorer
2. Navigate to: `C:\Users\elvec\Desktop\vera-nextjs\public\sounds\`
3. Drag your Freesound downloads into this folder
4. Rename them to match the names above

### Option 2: Command Line
```powershell
# Copy your files (replace SOURCE with your download location)
Copy-Item "C:\Users\elvec\Downloads\rain-sound.mp3" "C:\Users\elvec\Desktop\vera-nextjs\public\sounds\rain.mp3"
Copy-Item "C:\Users\elvec\Downloads\ocean-waves.mp3" "C:\Users\elvec\Desktop\vera-nextjs\public\sounds\ocean.mp3"
# ... etc
```

## File Requirements

- **Format**: MP3 (preferred) or WAV or OGG
- **Size**: Keep under 5MB each for faster loading
- **Quality**: 128kbps or higher
- **Loop-friendly**: Choose sounds that loop seamlessly

## After Adding Files

Run verification again:
```bash
node scripts/verify-setup.js
```

The ambient sound button will automatically use these files!

## Optional: Add More Sounds

To add more ambient sounds beyond these 6:

1. Add file to `public/sounds/` (e.g., `thunder.mp3`)
2. Edit `src/lib/sounds/ambient-sounds.ts`
3. Add new entry:
```typescript
{
  id: 'thunder',
  name: 'Distant Thunder',
  file: '/sounds/thunder.mp3',
  description: 'Calming thunder sounds',
  attribution: 'freesound.org',
}
```

The sound will automatically appear in the rotation!
