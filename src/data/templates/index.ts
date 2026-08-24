import type { Template } from '../../types/document';
import { frontendDeveloperTemplate } from './frontend-developer';
import { projectReadmeTemplate } from './project-readme';

/**
 * Whole-document starting points for the Templates picker (see
 * TemplatesMenu.tsx). Each template lives in its own file — `blocks` is
 * hand-authored in exactly the shape serializeCanvas() would produce (see
 * SerializedBlock in types/document.ts), so it can be handed straight to
 * editor.loadFromBlocks. Widget blocks reuse real library entries (see
 * src/data/community-components/ for badge/techIcon/stats/social, or ./meta
 * for the shared url-component meta shapes) so libId/type/settings/meta
 * match what placing that same component from the Library would actually
 * produce.
 *
 * To add a new template: add a new file exporting one `Template`, then list
 * it here — nothing else needs to change.
 */
export const TEMPLATES: Template[] = [frontendDeveloperTemplate, projectReadmeTemplate];
