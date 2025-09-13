"use client";

import React, { useRef, useState, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Plus,
  ImageIcon,
  Link as LinkIcon,
  Trash,
  Upload,
  ExternalLink,
  Play,
  Image as ImageIconSolid,
  Video,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MediaPreview {
  type: "youtube" | "image" | "video";
  src?: string;
  id?: string;
  name?: string;
}

interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
}

export default function EnhancedContentCard() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [nodes, setNodes] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const extractUrl = useCallback((text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/i;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  }, []);

  const isYouTubeUrl = useCallback((url: string) => {
    return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/i.test(
      url
    );
  }, []);

  const extractYouTubeId = useCallback((url: string) => {
    const ytRegex = /(?:v=|\/embed\/|\/)([0-9A-Za-z_-]{11})/;
    const match = url.match(ytRegex);
    return match ? match[1] : null;
  }, []);

  const isImageUrl = useCallback((url: string) => {
    return /\.(jpeg|jpg|gif|png|webp|svg)(?:\?|$)/i.test(url);
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const text = (e.clipboardData || (window as any).clipboardData).getData(
        "text"
      );
      const urlMatch = extractUrl(text);

      if (urlMatch) {
        e.preventDefault();
        const url = urlMatch;

        if (isYouTubeUrl(url)) {
          const id = extractYouTubeId(url);
          if (id) {
            setMediaPreview({ type: "youtube", id });
            setLinkPreview(null);
          }
        } else if (isImageUrl(url)) {
          setMediaPreview({ type: "image", src: url });
          setLinkPreview(null);
        } else {
          setLinkPreview({ url });
          setMediaPreview(null);
        }
        setContent((prev) => (prev ? `${prev}\n${url}` : url));
      }
    },
    [extractUrl, isYouTubeUrl, extractYouTubeId, isImageUrl]
  );

  const handleAddLink = useCallback(() => {
    const url = window.prompt("Enter a link (https://...)");
    if (!url || !url.startsWith("http")) return;

    if (isYouTubeUrl(url)) {
      const id = extractYouTubeId(url);
      if (id) {
        setMediaPreview({ type: "youtube", id });
        setLinkPreview(null);
      }
    } else if (isImageUrl(url)) {
      setMediaPreview({ type: "image", src: url });
      setLinkPreview(null);
    } else {
      setLinkPreview({ url });
      setMediaPreview(null);
    }
    setContent((prev) => (prev ? `${prev}\n${url}` : url));
  }, [isYouTubeUrl, extractYouTubeId, isImageUrl]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      const url = URL.createObjectURL(file);

      setTimeout(() => {
        if (file.type.startsWith("image/")) {
          setMediaPreview({ type: "image", src: url, name: file.name });
          setLinkPreview(null);
        } else if (file.type.startsWith("video/")) {
          setMediaPreview({ type: "video", src: url, name: file.name });
          setLinkPreview(null);
        }
        setContent((prev) =>
          prev ? `${prev}\n[uploaded] ${file.name}` : `[uploaded] ${file.name}`
        );
        setIsUploading(false);
      }, 500);
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (!file) return;

      const event = {
        target: { files: [file] },
      } as React.ChangeEvent<HTMLInputElement>;

      handleFileChange(event);
    },
    [handleFileChange]
  );

  const handleRemoveMedia = useCallback(() => {
    setMediaPreview(null);
    setLinkPreview(null);
  }, []);

  const handleAddNode = useCallback(() => {
    setNodes((prev) => prev + 1);
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
        <div className="relative w-full max-w-2xl">
          <Card className="w-full bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-700/50 shadow-2xl backdrop-blur-sm">
            <CardHeader className="px-4 py-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <Label className="text-base sm:text-lg text-slate-300 font-medium min-w-fit">
                  Title
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your title..."
                  className="flex-1 bg-slate-800/50 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:border-slate-500 transition-colors"
                />
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-6 sm:px-6">
              <div
                className={cn(
                  "rounded-xl border p-4 sm:p-6 bg-slate-800/50 transition-all duration-200",
                  isDragOver
                    ? "border-blue-400/50 bg-blue-900/20"
                    : "border-slate-600/50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Label className="text-slate-400 mb-3 block">Content</Label>

                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start typing or paste links, YouTube URLs... You can also drag and drop files here!"
                  onPaste={handlePaste}
                  className="min-h-[140px] sm:min-h-[160px] bg-slate-900/50 border-slate-600/30 text-slate-100 placeholder:text-slate-500 focus:border-slate-500 resize-none transition-colors"
                />

                {/* Link Preview */}
                {linkPreview && (
                  <div className="mt-4 p-3 border border-slate-600/50 rounded-lg bg-slate-700/30 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <ExternalLink
                          size={14}
                          className="text-slate-400 flex-shrink-0"
                        />
                        <span className="text-xs text-slate-400 uppercase tracking-wide">
                          Link Preview
                        </span>
                      </div>
                      <a
                        href={linkPreview.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm break-all"
                      >
                        {linkPreview.url}
                      </a>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLinkPreview(null)}
                      className="hover:bg-red-500/20 hover:text-red-400 flex-shrink-0"
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                )}

                {/* YouTube Preview */}
                {mediaPreview?.type === "youtube" && mediaPreview.id && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-slate-600/50 bg-slate-700/30">
                    <div className="flex items-center gap-2 p-3 bg-slate-800/50">
                      <Play size={16} className="text-red-400" />
                      <span className="text-sm text-slate-300">
                        YouTube Video
                      </span>
                    </div>
                    <div className="aspect-video">
                      <iframe
                        title="youtube-preview"
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${mediaPreview.id}`}
                        allowFullScreen
                      />
                    </div>
                    <div className="p-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveMedia}
                        className="hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Image Preview */}
                {mediaPreview?.type === "image" && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-slate-600/50 bg-slate-700/30">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <ImageIconSolid size={16} className="text-green-400" />
                        <span className="text-sm text-slate-300">
                          {mediaPreview.name || "Image"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveMedia}
                        className="hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                    <div className="p-4">
                      <Image
                        src={mediaPreview.src!}
                        alt="preview"
                        className="w-full max-h-64 object-contain rounded"
                        width={600}
                        height={400}
                      />
                    </div>
                  </div>
                )}

                {/* Video Preview */}
                {mediaPreview?.type === "video" && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-slate-600/50 bg-slate-700/30">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <Video size={16} className="text-purple-400" />
                        <span className="text-sm text-slate-300">
                          {mediaPreview.name || "Video"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveMedia}
                        className="hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                    <div className="p-4">
                      <video controls className="w-full max-h-64 rounded">
                        <source src={mediaPreview.src} />
                      </video>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 border-slate-600/50 hover:bg-slate-700/50"
                        onClick={handleAddLink}
                      >
                        <LinkIcon size={16} />
                        <span className="text-sm">Add Link</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add a web link or YouTube URL</p>
                    </TooltipContent>
                  </Tooltip>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Upload className="animate-spin" size={16} />
                        ) : (
                          <ImageIcon size={16} />
                        )}
                        <span className="text-sm">
                          {isUploading ? "Uploading..." : "Add Media"}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload images or videos</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-4 py-4 sm:px-6 flex justify-between items-center border-t border-slate-700/50">
              <div className="text-sm text-slate-400">
                <span className="font-medium">{nodes}</span> node
                {nodes !== 1 ? "s" : ""} added
              </div>
              <div className="text-xs text-slate-500">
                {title.length > 0 && `${title.length} chars in title`}
              </div>
            </CardFooter>
          </Card>

          {/* Add Node Button */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-full flex flex-col items-center -translate-y-2">
            <div className="w-0.5 h-12 bg-gradient-to-b from-slate-600 to-transparent" />
            <div className="relative -top-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleAddNode}
                    className="rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-xl bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border border-blue-500/50 transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add a new content node</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
