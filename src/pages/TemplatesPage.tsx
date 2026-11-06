import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TemplateConfig } from '../types';
import { LayoutTemplate, Check, Save } from 'lucide-react';

export const TemplatesPage: React.FC = () => {
  const { templates, saveTemplate, showToast } = useApp();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig>(templates[0]);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [scopeHeading, setScopeHeading] = useState(selectedTemplate.scopeHeading);
  const [preparedByHeading, setPreparedByHeading] = useState(selectedTemplate.preparedByHeading);
  const [defaultTerms, setDefaultTerms] = useState(selectedTemplate.defaultTerms);
  const [footerMessage, setFooterMessage] = useState(selectedTemplate.footerMessage);

  const handleSelectTemplate = (tpl: TemplateConfig) => {
    setSelectedTemplate(tpl);
    setScopeHeading(tpl.scopeHeading);
    setPreparedByHeading(tpl.preparedByHeading);
    setDefaultTerms(tpl.defaultTerms);
    setFooterMessage(tpl.footerMessage);
    setIsEditing(false);
  };

  const handleSetDefault = (tpl: TemplateConfig) => {
    templates.forEach((t) => {
      saveTemplate({ ...t, isDefault: t.id === tpl.id });
    });
    showToast(`Template "${tpl.name}" is now the default layout`, 'success');
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TemplateConfig = {
      ...selectedTemplate,
      scopeHeading,
      preparedByHeading,
      defaultTerms,
      footerMessage,
    };
    saveTemplate(updated);
    setSelectedTemplate(updated);
    setIsEditing(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-blue-600" />
            <span>Document Templates</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Branded document presentation layouts for client quotation PDFs and printed proposals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selectors */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Available Layouts
          </h2>
          {templates.map((tpl) => {
            const isSelected = selectedTemplate.id === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 ring-1 ring-blue-600'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                    {tpl.name}
                  </span>
                  {tpl.isDefault && (
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{tpl.description}</p>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px]">
                  <span className="font-mono text-neutral-400">Layout: {tpl.layout}</span>
                  {!tpl.isDefault && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(tpl);
                      }}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Make Default
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Customization & Preview Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                  Configuring {selectedTemplate.name}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Headings and standard terms rendered on quotes using this template.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-600 font-semibold hover:underline"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Copy'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                    Scope of Works Heading:
                  </label>
                  <input
                    type="text"
                    value={scopeHeading}
                    onChange={(e) => setScopeHeading(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                    Prepared By Subtitle Heading:
                  </label>
                  <input
                    type="text"
                    value={preparedByHeading}
                    onChange={(e) => setPreparedByHeading(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                    Default Payment Terms:
                  </label>
                  <textarea
                    value={defaultTerms}
                    onChange={(e) => setDefaultTerms(e.target.value)}
                    rows={2}
                    className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                    Footer Closing Message:
                  </label>
                  <input
                    type="text"
                    value={footerMessage}
                    onChange={(e) => setFooterMessage(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-lg font-semibold"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Template Settings</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Scope Heading</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">{selectedTemplate.scopeHeading}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Prepared By Heading</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">{selectedTemplate.preparedByHeading}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Default Terms Copy</span>
                  <p className="text-neutral-700 dark:text-neutral-300 text-xs leading-relaxed">{selectedTemplate.defaultTerms}</p>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Footer Message</span>
                  <p className="text-neutral-700 dark:text-neutral-300 text-xs">{selectedTemplate.footerMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
