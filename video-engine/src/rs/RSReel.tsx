// @ts-nocheck
/** Wrapper cloud del Reel di ReelStudio: gli asset (font, suoni, musiche, loghi) stanno in public/rs/, il video in public/. */
import React from "react";
import { staticFile } from "remotion";
import { Reel, reelDuration } from "./Reel";

export const rsProps = (p: any) => ({
  ...p,
  assetBase: staticFile("rs").replace(/\/$/, ""),
  videoUrl: p.videoFile ? staticFile(p.videoFile) : p.videoUrl,
  cutoutBase: p.cutoutDir ? staticFile(p.cutoutDir) : p.cutoutBase,
});

export const RSReel: React.FC<any> = (p) => <Reel {...rsProps(p)} />;
export const rsDuration = (p: any) => reelDuration(p);
