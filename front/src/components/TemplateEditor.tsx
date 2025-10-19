import React, { useState, useRef, useEffect } from 'react';
import { Template, TemplateElement } from '../lib/templates';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Download, Type, Image as ImageIcon, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TemplateEditorProps {
  template: Template;
  propertyImages: string[];
  propertyData?: {
    address?: string;
    city?: string;
    state?: string;
    price?: number;
    bedrooms?: number;
    bathrooms?: number;
    squareFeet?: number;
  };
  onClose: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  propertyImages,
  propertyData,
  onClose,
}) => {
  const [elements, setElements] = useState<TemplateElement[]>(template.elements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.5);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  // Auto-populate property data
  useEffect(() => {
    if (propertyData) {
      setElements((prev) =>
        prev.map((el) => {
          if (el.type === 'text') {
            let newContent = el.content;
            
            // Replace placeholders
            if (newContent?.includes('123 Ocean Drive') && propertyData.address) {
              newContent = newContent.replace('123 Ocean Drive', propertyData.address);
            }
            if (newContent?.includes('Miami Beach') && propertyData.city) {
              newContent = newContent.replace('Miami Beach', propertyData.city);
            }
            if (newContent?.includes('$2,500,000') && propertyData.price) {
              newContent = newContent.replace('$2,500,000', `$${propertyData.price.toLocaleString()}`);
            }
            if (newContent?.includes('4 Bed') && propertyData.bedrooms) {
              newContent = newContent.replace('4 Bed', `${propertyData.bedrooms} Bed`);
            }
            if (newContent?.includes('3 Bath') && propertyData.bathrooms) {
              newContent = newContent.replace('3 Bath', `${propertyData.bathrooms} Bath`);
            }
            if (newContent?.includes('3,200 SqFt') && propertyData.squareFeet) {
              newContent = newContent.replace('3,200 SqFt', `${propertyData.squareFeet.toLocaleString()} SqFt`);
            }
            if (newContent?.includes('3,200 SF') && propertyData.squareFeet) {
              newContent = newContent.replace('3,200 SF', `${propertyData.squareFeet.toLocaleString()} SF`);
            }
            
            // Multi-line replacements
            if (newContent?.includes('4 Bedrooms') && propertyData.bedrooms) {
              newContent = newContent.replace('4 Bedrooms', `${propertyData.bedrooms} Bedrooms`);
            }
            if (newContent?.includes('3 Bathrooms') && propertyData.bathrooms) {
              newContent = newContent.replace('3 Bathrooms', `${propertyData.bathrooms} Bathrooms`);
            }
            
            return { ...el, content: newContent };
          }
          // Auto-fill first image
          if (el.type === 'image' && !el.imageUrl && propertyImages.length > 0) {
            return { ...el, imageUrl: propertyImages[0] };
          }
          return el;
        })
      );
    }
  }, [propertyData, propertyImages]);

  const updateElement = (id: string, updates: Partial<TemplateElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const deleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setSelectedElementId(null);
  };

  const duplicateElement = (id: string) => {
    const element = elements.find((el) => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: `${element.id}_copy_${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20,
      };
      setElements((prev) => [...prev, newElement]);
    }
  };

  const downloadImage = async () => {
    try {
      // Create a native canvas element
      const canvas = document.createElement('canvas');
      canvas.width = template.width;
      canvas.height = template.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        toast.error('Canvas not supported');
        return;
      }

      // Draw background
      ctx.fillStyle = template.backgroundColor;
      ctx.fillRect(0, 0, template.width, template.height);

      // Draw each element
      for (const element of elements) {
        ctx.save();

        // Set opacity
        ctx.globalAlpha = element.opacity || 1;

        if (element.type === 'shape') {
          ctx.fillStyle = element.backgroundColor || '#000000';
          if (element.borderRadius) {
            // Draw rounded rectangle
            const x = element.x;
            const y = element.y;
            const w = element.width;
            const h = element.height;
            const r = element.borderRadius;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillRect(element.x, element.y, element.width, element.height);
          }
        } else if (element.type === 'image' && element.imageUrl) {
          // Load and draw image
          await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              ctx.save();
              ctx.globalAlpha = element.opacity || 1;
              
              // Clip for border radius
              if (element.borderRadius) {
                const x = element.x;
                const y = element.y;
                const w = element.width;
                const h = element.height;
                const r = element.borderRadius;
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                ctx.lineTo(x + w, y + h - r);
                ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                ctx.lineTo(x + r, y + h);
                ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                ctx.lineTo(x, y + r);
                ctx.quadraticCurveTo(x, y, x + r, y);
                ctx.closePath();
                ctx.clip();
              }
              
              // Draw image with object-fit
              const objectFit = element.objectFit || 'cover';
              if (objectFit === 'cover') {
                const scale = Math.max(
                  element.width / img.width,
                  element.height / img.height
                );
                const scaledW = img.width * scale;
                const scaledH = img.height * scale;
                const offsetX = element.x + (element.width - scaledW) / 2;
                const offsetY = element.y + (element.height - scaledH) / 2;
                ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
              } else if (objectFit === 'contain') {
                const scale = Math.min(
                  element.width / img.width,
                  element.height / img.height
                );
                const scaledW = img.width * scale;
                const scaledH = img.height * scale;
                const offsetX = element.x + (element.width - scaledW) / 2;
                const offsetY = element.y + (element.height - scaledH) / 2;
                ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
              } else {
                ctx.drawImage(img, element.x, element.y, element.width, element.height);
              }
              
              ctx.restore();
              resolve();
            };
            img.onerror = () => {
              console.error('Failed to load image:', element.imageUrl);
              resolve(); // Continue even if image fails
            };
            img.src = element.imageUrl;
          });
        } else if (element.type === 'text' && element.content) {
          ctx.fillStyle = element.color || '#000000';
          ctx.font = `${element.fontWeight || '400'} ${element.fontSize || 24}px sans-serif`;
          ctx.textAlign = element.textAlign || 'left';
          
          // Handle multi-line text
          const lines = element.content.split('\n');
          const lineHeight = (element.fontSize || 24) * 1.2;
          const verticalAlign = 'center'; // Simplified - always center
          const totalHeight = lines.length * lineHeight;
          const startY = element.y + (element.height - totalHeight) / 2 + (element.fontSize || 24) * 0.8;
          
          lines.forEach((line, index) => {
            let x = element.x + 8; // Padding
            if (element.textAlign === 'center') {
              x = element.x + element.width / 2;
            } else if (element.textAlign === 'right') {
              x = element.x + element.width - 8;
            }
            
            ctx.fillText(line, x, startY + index * lineHeight);
          });
        }

        ctx.restore();
      }

      // Convert to download
      const link = document.createElement('a');
      link.download = `${template.name.replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('Template downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex">
      {/* Left Sidebar - Tools */}
      <div className="w-80 bg-white p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2>{template.name}</h2>
          <Button onClick={onClose} variant="ghost" size="sm">
            Close
          </Button>
        </div>

        {/* Image Selection */}
        <div className="mb-6">
          <Label className="mb-2 block">Property Photos</Label>
          <div className="grid grid-cols-2 gap-2">
            {propertyImages.map((img, index) => (
              <div
                key={index}
                className="aspect-square bg-gray-100 rounded cursor-pointer overflow-hidden border-2 border-transparent hover:border-blue-500 transition"
                onClick={() => {
                  if (selectedElement?.type === 'image') {
                    updateElement(selectedElement.id, { imageUrl: img });
                  }
                }}
              >
                <img src={img} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {selectedElement?.type === 'image'
              ? 'Click a photo to use it in the selected image element'
              : 'Select an image element to change its photo'}
          </p>
        </div>

        {/* Element Properties */}
        {selectedElement && (
          <Card className="p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3>Element Properties</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => duplicateElement(selectedElement.id)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteElement(selectedElement.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {selectedElement.type === 'text' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="text-content">Text</Label>
                  <textarea
                    id="text-content"
                    className="w-full p-2 border rounded mt-1"
                    rows={3}
                    value={selectedElement.content || ''}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { content: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="font-size">Font Size: {selectedElement.fontSize}px</Label>
                  <Slider
                    id="font-size"
                    min={12}
                    max={120}
                    step={2}
                    value={[selectedElement.fontSize || 24]}
                    onValueChange={([value]) =>
                      updateElement(selectedElement.id, { fontSize: value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="text-color">Color</Label>
                  <Input
                    id="text-color"
                    type="color"
                    value={selectedElement.color || '#000000'}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { color: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {selectedElement.type === 'shape' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="bg-color">Background Color</Label>
                  <Input
                    id="bg-color"
                    type="color"
                    value={selectedElement.backgroundColor || '#000000'}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { backgroundColor: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="opacity">Opacity: {Math.round((selectedElement.opacity || 1) * 100)}%</Label>
                  <Slider
                    id="opacity"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[selectedElement.opacity || 1]}
                    onValueChange={([value]) =>
                      updateElement(selectedElement.id, { opacity: value })
                    }
                  />
                </div>
              </div>
            )}

            {selectedElement.type === 'image' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Click a photo above to change this image
                </p>
                <div>
                  <Label htmlFor="opacity">Opacity: {Math.round((selectedElement.opacity || 1) * 100)}%</Label>
                  <Slider
                    id="opacity"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[selectedElement.opacity || 1]}
                    onValueChange={([value]) =>
                      updateElement(selectedElement.id, { opacity: value })
                    }
                  />
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Zoom */}
        <div className="mb-4">
          <Label>Zoom: {Math.round(scale * 100)}%</Label>
          <Slider
            min={0.25}
            max={1}
            step={0.05}
            value={[scale]}
            onValueChange={([value]) => setScale(value)}
          />
        </div>

        {/* Download */}
        <Button onClick={downloadImage} className="w-full gap-2">
          <Download className="w-4 h-4" />
          Download Template
        </Button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-gray-900">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          <div
            ref={canvasRef}
            style={{
              width: template.width,
              height: template.height,
              backgroundColor: template.backgroundColor,
              position: 'relative',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)',
            }}
          >
            {elements.map((element) => (
              <div
                key={element.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElementId(element.id);
                }}
                style={{
                  position: 'absolute',
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  cursor: 'pointer',
                  border:
                    selectedElementId === element.id
                      ? '2px solid #3b82f6'
                      : '2px solid transparent',
                  ...(element.type === 'text' && {
                    fontSize: element.fontSize,
                    fontWeight: element.fontWeight,
                    color: element.color,
                    textAlign: element.textAlign,
                    display: 'flex',
                    alignItems: 'center',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    padding: '8px',
                  }),
                  ...(element.type === 'shape' && {
                    backgroundColor: element.backgroundColor,
                    borderRadius: element.borderRadius,
                    opacity: element.opacity,
                  }),
                  ...(element.type === 'image' && {
                    overflow: 'hidden',
                    borderRadius: element.borderRadius,
                    opacity: element.opacity,
                  }),
                }}
              >
                {element.type === 'text' && element.content}
                {element.type === 'image' && element.imageUrl && (
                  <img
                    src={element.imageUrl}
                    alt="Property"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: element.objectFit || 'cover',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
