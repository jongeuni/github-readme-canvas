declare global {
  interface Window {
    umami?: { track: (eventName: string, eventData?: Record<string, string>) => void };
  }
}

type AnalyticsEvent =
  | { name: 'component_view'; props: { component_type: string; component_id: string } }
  | { name: 'component_added'; props: { component_type: string; component_id: string; source: 'library' | 'custom' } }
  | { name: 'preset_selected'; props: { component_type: string; preset_id: string } }
  | { name: 'template_used'; props: { template_id: string } }
  | { name: 'markdown_copied' }
  | { name: 'markdown_exported' }
  | { name: 'github_committed'; props: { mode: 'direct' | 'branch' } };

/** Umami's script may be blocked (ad blocker) or not yet loaded — `track`
 *  must never throw into the click handler that triggered it. */
export function track(event: AnalyticsEvent): void {
  window.umami?.track(event.name, 'props' in event ? event.props : undefined);
}
