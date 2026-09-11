const fs = require('fs');
const file = 'src/app/e/[slug]/registration-client.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change showGuestForm to showForm
content = content.replace(/const \[showGuestForm, setShowGuestForm\] = useState\(false\);/g, 'const [showForm, setShowForm] = useState(false);');
content = content.replace(/showGuestForm/g, 'showForm');

// 2. Change logic in handleRegister
content = content.replace(/if \(!isLoggedIn && !showForm\)/g, 'const needsForm = !isLoggedIn || requireB2bData || customFields.length > 0;\n    if (needsForm && !showForm)');

content = content.replace(/if \(!isLoggedIn && showForm\)/g, 'if (needsForm && showForm)');

// 3. Update guestData initialization
content = content.replace(/let guestData: any = !isLoggedIn \? \{/g, 'let guestData: any = needsForm ? {');

content = content.replace(/guestData = undefined; \/\/ For backward compatibility if neither exist/g, 'guestData.customData = customData;\n        if (!trackingLinkId && !requireB2bData && customFields.length === 0) guestData = undefined;');

// 4. Update the render logic
content = content.replace(/\{showForm && !isLoggedIn && \(/g, '{showForm && (');
content = content.replace(/<h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white\/10 pb-2">Guest Details<\/h4>/g, '<h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Attendee Details</h4>');

// 5. Wrap Name/Email in !isLoggedIn
content = content.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4">/g, '{!isLoggedIn && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">');
content = content.replace(/<\/div>\n\n            \{requireB2bData/g, '</div>)}\n\n            {requireB2bData');

// 6. Append Custom Fields render before the button
const customFieldsRender = `
            {customFields.length > 0 && (
              <div className="pt-4 border-t border-white/5 space-y-4">
                {customFields.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                      {field.field_label} {field.is_required && <span className="text-brand-primary">*</span>}
                    </label>
                    {field.field_type === 'text' && (
                      <input
                        type="text"
                        required={field.is_required}
                        value={customData[field.field_name] || ''}
                        onChange={e => setCustomData(prev => ({ ...prev, [field.field_name]: e.target.value }))}
                        className="w-full bg-surface border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                      />
                    )}
                    {field.field_type === 'long_text' && (
                      <textarea
                        required={field.is_required}
                        value={customData[field.field_name] || ''}
                        onChange={e => setCustomData(prev => ({ ...prev, [field.field_name]: e.target.value }))}
                        className="w-full bg-surface border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                      />
                    )}
                    {field.field_type === 'select' && (
                      <select
                        required={field.is_required}
                        value={customData[field.field_name] || ''}
                        onChange={e => setCustomData(prev => ({ ...prev, [field.field_name]: e.target.value }))}
                        className="w-full bg-surface border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-brand-primary/50 transition-colors appearance-none"
                      >
                        <option value="">Select an option...</option>
                        {field.options?.map((opt: string) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {field.field_type === 'checkbox' && (
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors">
                        <input
                          type="checkbox"
                          required={field.is_required}
                          checked={customData[field.field_name] || false}
                          onChange={e => setCustomData(prev => ({ ...prev, [field.field_name]: e.target.checked }))}
                          className="w-4 h-4 rounded bg-surface border-white/20 text-brand-primary focus:ring-brand-primary/50"
                        />
                        <span className="text-sm font-medium text-white">Yes</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            )}
`;

content = content.replace(/<\/form>\n        \)}/g, customFieldsRender + '\n          </form>\n        )}');

// Fix the missing closing tags if any. Wait, it's better to just write the file.
fs.writeFileSync(file, content);
