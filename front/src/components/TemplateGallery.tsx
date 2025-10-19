import React, { useState } from 'react';
import { realEstateTemplates, Template } from '../lib/templates';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Palette, Image as ImageIcon } from 'lucide-react';

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void;
  onClose: () => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  onSelectTemplate,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'instagram-post', name: 'Instagram Post' },
    { id: 'instagram-story', name: 'Instagram Story' },
    { id: 'facebook-post', name: 'Facebook Post' },
  ];

  const filteredTemplates =
    selectedCategory === 'all'
      ? realEstateTemplates
      : realEstateTemplates.filter((t) => t.category === selectedCategory);

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'instagram-post':
        return 'bg-pink-500';
      case 'instagram-story':
        return 'bg-purple-500';
      case 'facebook-post':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'instagram-post':
        return 'Instagram Post';
      case 'instagram-story':
        return 'Instagram Story';
      case 'facebook-post':
        return 'Facebook Post';
      default:
        return category;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1>Social Media Templates</h1>
            <p className="text-gray-600 mt-1">
              Choose a template to create stunning social media posts for your property
            </p>
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>

        {/* Category Filter */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => onSelectTemplate(template)}
            >
              <div
                className="relative bg-gray-100 flex items-center justify-center p-8"
                style={{
                  aspectRatio: `${template.width}/${template.height}`,
                  backgroundColor: template.backgroundColor,
                }}
              >
                {/* Template Preview (simplified) */}
                <div
                  className="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition"
                  style={{
                    background: `linear-gradient(135deg, ${template.backgroundColor} 0%, ${template.backgroundColor}dd 100%)`,
                  }}
                >
                  <div className="text-center">
                    <Palette className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm opacity-75">
                      {template.width} × {template.height}
                    </p>
                  </div>
                </div>
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition flex items-center justify-center">
                  <Button
                    className="opacity-0 group-hover:opacity-100 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTemplate(template);
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="line-clamp-1">{template.name}</h3>
                  <Badge className={getCategoryBadgeColor(template.category)}>
                    {getCategoryLabel(template.category)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {template.width} × {template.height}px
                </p>
              </div>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No templates found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};
