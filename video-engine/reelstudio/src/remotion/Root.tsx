import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Reel, reelDuration } from './Reel';
import { Slide, FORMATS } from './Slide';

const defaultReel: any = {
  assetBase: 'http://localhost:4321',
  videoUrl: '',
  fps: 30,
  width: 1080,
  height: 1920,
  srcWidth: 1080,
  srcHeight: 1920,
  cuts: [{ s: 0, e: 5 }],
  words: [],
  brand: {},
  style: {},
  hook: {},
  cta: {},
  effects: [],
  audio: {},
};

const Root: React.FC = () => (
  <>
    <Composition
      id="Reel"
      component={Reel as any}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={150}
      defaultProps={defaultReel}
      calculateMetadata={({ props }: any) => ({ durationInFrames: reelDuration(props), fps: props.fps || 30 })}
    />
    <Composition id="Slide" component={Slide as any} width={1080} height={1350} fps={30} durationInFrames={1} defaultProps={{ assetBase: '', brand: {}, style: {}, slide: {}, index: 0, total: 1, format: '4:5' } as any} calculateMetadata={({ props }: any) => ({ width: 1080, height: (FORMATS[props.format || '4:5'] || FORMATS['4:5']).h })} />
    <Composition id="SlideVideo" component={Slide as any} width={1080} height={1350} fps={30} durationInFrames={150} defaultProps={{ assetBase: '', brand: {}, style: {}, slide: {}, index: 0, total: 1, format: '4:5', animate: { mode: 'morbido', durationSec: 5 } } as any} calculateMetadata={({ props }: any) => ({ width: 1080, height: (FORMATS[props.format || '4:5'] || FORMATS['4:5']).h, durationInFrames: Math.round((props.animate?.durationSec || 5) * 30) })} />
  </>
);

registerRoot(Root);
