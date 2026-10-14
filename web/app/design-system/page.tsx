"use client";

import { useState } from "react";
import { Search, Plus, Download, Trash2, Eye, Edit } from "lucide-react";

// UI Components
import { Button }              from "@/components/ui/Button";
import { Input }               from "@/components/ui/Input";
import { Select }              from "@/components/ui/Select";
import { DatePicker }          from "@/components/ui/DatePicker";
import { Textarea }            from "@/components/ui/Textarea";
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge, CaseStatusBadge, OutcomeBadge, RoleBadge }  from "@/components/ui/Badge";
import { Tabs, TabList, TabTrigger, TabPanel }               from "@/components/ui/Tabs";
import { Modal, BottomSheet, ConfirmDialog }                 from "@/components/ui/Modal";
import { Table, CardList }     from "@/components/ui/Table";
import { EmptyState }          from "@/components/ui/EmptyState";
import { Skeleton, SkeletonText, SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";
import { useToast }            from "@/components/ui/Toast";
import { LoadingSpinner }      from "@/components/ui/LoadingSpinner";
import { Logo }                from "@/components/shared/Logo";

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-heading font-semibold text-navy border-b border-navy-100 pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ children, wrap = true }: { children: React.ReactNode; wrap?: boolean }) {
  return (
    <div className={`flex ${wrap ? "flex-wrap" : ""} items-center gap-3`}>
      {children}
    </div>
  );
}

// ─── Sample table data ────────────────────────────────────────────────────────
const TABLE_DATA = [
  { id: "1", caseRef: "WP-1234/2024", parties: "Aslam Khan vs Province of Punjab", type: "Writ",   status: "running" as const, nextDate: "15 Jan 2025" },
  { id: "2", caseRef: "FCA-201/2024", parties: "فاطمہ بی بی vs ارسلان احمد",       type: "Family", status: "running" as const, nextDate: "20 Jan 2025" },
  { id: "3", caseRef: "CS-778/2022",  parties: "Aslam Khan vs Lahore Waste Mgmt",  type: "Civil",  status: "decided" as const, nextDate: "—" },
];

export default function DesignSystemPage() {
  const toast = useToast();

  const [modalOpen,   setModalOpen]   = useState(false);
  const [sheetOpen,   setSheetOpen]   = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [inputVal,    setInputVal]    = useState("");
  const [textareaVal, setTextareaVal] = useState("");
  const [selectVal,   setSelectVal]   = useState("");
  const [dateVal,     setDateVal]     = useState("");
  const [urduText,    setUrduText]    = useState("فاطمہ بی بی");

  return (
    <div className="min-h-dvh bg-offwhite">
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
        <Logo size="sm" variant="full" />
        <span className="text-sm text-navy-200 font-mono">Design System Preview</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-12">

        {/* ── Brand ─────────────────────────────────────────────────── */}
        <Section title="Brand & Logo">
          <Row>
            <Logo size="xs"  variant="full" />
            <Logo size="sm"  variant="full" />
            <Logo size="md"  variant="full" />
            <Logo size="lg"  variant="full" />
          </Row>
          <Row>
            <Logo size="sm"  variant="mark" />
            <Logo size="md"  variant="mark" />
            <Logo size="lg"  variant="mark" />
          </Row>
          {/* Palette */}
          <div className="flex flex-wrap gap-3">
            {[
              ["bg-gold",     "#8A6414", "Gold"],
              ["bg-navy",     "#0B1B3A", "Navy"],
              ["bg-offwhite border border-navy-100", "#F7F7F4", "Off-white"],
              ["bg-success",  "#1F7A4D", "Success"],
              ["bg-danger",   "#C0392B", "Danger"],
              ["bg-warning",  "#D97706", "Warning"],
              ["bg-info",     "#2563EB", "Info"],
            ].map(([bg, hex, label]) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className={`w-12 h-12 rounded-xl ${bg}`} />
                <span className="text-[10px] text-navy-400 font-mono">{hex}</span>
                <span className="text-[10px] text-navy font-medium">{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Typography ───────────────────────────────────────────── */}
        <Section title="Typography">
          <h1 className="font-heading text-3xl font-bold text-navy">Playfair Display H1 — Case Management</h1>
          <h2 className="font-heading text-2xl font-semibold text-navy">H2 — MZM & Associates</h2>
          <h3 className="font-cormorant text-xl font-semibold text-navy">Cormorant Garamond — Legal Documents</h3>
          <p className="font-body text-base text-navy">Inter body text — Muhammad Aslam Khan vs Province of Punjab. Civil case filed on 15 March 2024.</p>
          <p className="font-body text-sm text-navy-400">Small body / labels — Next hearing date: 15 Jan 2025</p>
          <p className="font-urdu text-2xl text-navy text-end" dir="rtl">نوٹو نستعلیق اردو — فاطمہ بی بی بنام ارسلان احمد</p>
          <p className="font-mono text-sm text-navy-400">Monospace — WP-1234/2024 · 35201-1234567-1</p>
        </Section>

        {/* ── Buttons ──────────────────────────────────────────────── */}
        <Section title="Buttons">
          <Row>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </Row>
          <Row>
            <Button size="xs">XS</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button leftIcon={<Plus className="w-4 h-4" />}>New Case</Button>
            <Button rightIcon={<Download className="w-4 h-4" />} variant="secondary">Export</Button>
          </Row>
        </Section>

        {/* ── Form Fields ──────────────────────────────────────────── */}
        <Section title="Form Fields">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Case Reference No."
              placeholder="WP-1234/2024"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
              required
            />
            <Input
              label="With Error"
              placeholder="Enter CNIC"
              error="CNIC format: 35201-1234567-1"
              defaultValue="12345"
            />
            <Select
              label="Case Type"
              value={selectVal}
              onChange={(e) => setSelectVal(e.target.value)}
              options={[
                { value: "civil",    label: "Civil" },
                { value: "criminal", label: "Criminal" },
                { value: "family",   label: "Family" },
                { value: "writ",     label: "Writ" },
              ]}
              placeholder="Select case type"
              required
            />
            <DatePicker
              label="Next Hearing Date"
              value={dateVal}
              onChange={(e) => setDateVal(e.target.value)}
            />
            <Textarea
              label="Current Proceeding"
              value={textareaVal}
              onChange={(e) => setTextareaVal(e.target.value)}
              placeholder="Describe what happened at this hearing…"
              rows={3}
            />
            <Textarea
              label="Urdu Text (auto-RTL)"
              value={urduText}
              onChange={(e) => setUrduText(e.target.value)}
              hint="Type Urdu to auto-switch direction"
              rows={3}
            />
          </div>
        </Section>

        {/* ── Badges ───────────────────────────────────────────────── */}
        <Section title="Badges">
          <Row>
            <Badge variant="gold">Gold</Badge>
            <Badge variant="navy">Navy</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="purple">Purple</Badge>
          </Row>
          <Row>
            <Badge variant="success" dot>With Dot</Badge>
            <Badge variant="danger"  dot>Danger Dot</Badge>
            <Badge size="sm">Small</Badge>
          </Row>
          <Row>
            <CaseStatusBadge status="running" />
            <CaseStatusBadge status="decided" />
            <OutcomeBadge outcome="won" />
            <OutcomeBadge outcome="lost" />
            <OutcomeBadge outcome="settled" />
            <OutcomeBadge outcome="dismissed" />
            <OutcomeBadge outcome="withdrawn" />
          </Row>
          <Row>
            <RoleBadge role="super_admin" />
            <RoleBadge role="admin" />
            <RoleBadge role="lawyer" />
            <RoleBadge role="clerk" />
          </Row>
        </Section>

        {/* ── Cards ────────────────────────────────────────────────── */}
        <Section title="Cards">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>WP-1234/2024</CardTitle>
                <CaseStatusBadge status="running" />
              </CardHeader>
              <CardBody>Aslam Khan vs Province of Punjab</CardBody>
              <CardFooter>
                <Button size="xs" variant="secondary" leftIcon={<Eye className="w-3.5 h-3.5" />}>View</Button>
                <Button size="xs" leftIcon={<Edit className="w-3.5 h-3.5" />}>Edit</Button>
              </CardFooter>
            </Card>
            <Card hover>
              <CardBody>Hover effect card</CardBody>
            </Card>
            <Card clickable>
              <CardBody>Clickable card (keyboard accessible)</CardBody>
            </Card>
          </div>
        </Section>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <Section title="Tabs">
          <Tabs defaultValue="running">
            <TabList>
              <TabTrigger value="running" count={16}>Running</TabTrigger>
              <TabTrigger value="decided" count={4}>Decided</TabTrigger>
              <TabTrigger value="all">All Cases</TabTrigger>
            </TabList>
            <TabPanel value="running">
              <p className="text-sm text-navy-400">16 running cases shown here.</p>
            </TabPanel>
            <TabPanel value="decided">
              <p className="text-sm text-navy-400">4 decided cases shown here.</p>
            </TabPanel>
            <TabPanel value="all">
              <p className="text-sm text-navy-400">All 20 cases shown here.</p>
            </TabPanel>
          </Tabs>
        </Section>

        {/* ── Table + Card List ─────────────────────────────────────── */}
        <Section title="Table (desktop) / Card List (mobile)">
          {/* Desktop table */}
          <div className="hidden md:block">
            <Table
              columns={[
                { key: "ref",     header: "Case Ref",  render: (r) => <span className="font-mono text-xs">{r.caseRef}</span> },
                { key: "parties", header: "Parties",   render: (r) => <span dir="auto">{r.parties}</span> },
                { key: "type",    header: "Type",      render: (r) => <Badge variant="navy" size="sm">{r.type}</Badge> },
                { key: "status",  header: "Status",    render: (r) => <CaseStatusBadge status={r.status} /> },
                { key: "next",    header: "Next Date", render: (r) => r.nextDate },
                { key: "actions", header: "",          render: () => (
                  <Button size="xs" variant="ghost" leftIcon={<Eye className="w-3.5 h-3.5" />}>View</Button>
                )},
              ]}
              data={TABLE_DATA}
              keyExtractor={(r) => r.id}
              onRowClick={(r) => toast.info("Row clicked", r.caseRef)}
            />
          </div>
          {/* Mobile card list */}
          <div className="md:hidden">
            <CardList
              data={TABLE_DATA}
              keyExtractor={(r) => r.id}
              renderItem={(r) => (
                <Card>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-gold font-semibold">{r.caseRef}</p>
                      <p className="text-sm text-navy font-medium truncate mt-0.5" dir="auto">{r.parties}</p>
                      <p className="text-xs text-navy-400 mt-1">Next: {r.nextDate}</p>
                    </div>
                    <CaseStatusBadge status={r.status} />
                  </div>
                </Card>
              )}
            />
          </div>
        </Section>

        {/* ── Loading States ───────────────────────────────────────── */}
        <Section title="Loading & Skeleton">
          <Row>
            <LoadingSpinner size="xs" />
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
          </Row>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-navy-400 mb-2">SkeletonText</p>
              <SkeletonText lines={4} />
            </div>
            <div>
              <p className="text-xs text-navy-400 mb-2">SkeletonCard</p>
              <SkeletonCard />
            </div>
          </div>
          <div>
            <p className="text-xs text-navy-400 mb-2">SkeletonTable</p>
            <SkeletonTable rows={3} />
          </div>
        </Section>

        {/* ── Empty State ──────────────────────────────────────────── */}
        <Section title="Empty State">
          <Card>
            <EmptyState
              title="No cases found"
              message="Try adjusting your search filters or add a new case."
              action={<Button leftIcon={<Plus className="w-4 h-4" />}>Add Case</Button>}
            />
          </Card>
        </Section>

        {/* ── Toast ────────────────────────────────────────────────── */}
        <Section title="Toast Notifications">
          <Row>
            <Button onClick={() => toast.success("Case saved!", "WP-1234/2024 updated successfully.")} variant="primary" size="sm">
              Success Toast
            </Button>
            <Button onClick={() => toast.error("Error", "Failed to save case. Please try again.")} variant="danger" size="sm">
              Error Toast
            </Button>
            <Button onClick={() => toast.warning("Warning", "Hearing date is within 10 days.")} variant="secondary" size="sm">
              Warning Toast
            </Button>
            <Button onClick={() => toast.info("Info", "New hearing added to cause list.")} variant="ghost" size="sm">
              Info Toast
            </Button>
          </Row>
        </Section>

        {/* ── Modal / BottomSheet ──────────────────────────────────── */}
        <Section title="Modal & Bottom Sheet">
          <Row>
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Button variant="secondary" onClick={() => setSheetOpen(true)}>Open Bottom Sheet</Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>Confirm Dialog</Button>
          </Row>

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Add New Hearing"
            footer={
              <>
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={() => { toast.success("Hearing saved!"); setModalOpen(false); }}>Save</Button>
              </>
            }
          >
            <div className="space-y-4">
              <DatePicker label="Hearing Date" required />
              <Input label="Serial No." placeholder="14" />
              <Textarea label="Current Proceeding" rows={3} placeholder="Arguments heard…" />
              <DatePicker label="Next Date" />
            </div>
          </Modal>

          <BottomSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title="Case Details"
          >
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-navy-400">Case Ref</span>
                <span className="font-mono font-semibold">WP-1234/2024</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy-400">Parties</span>
                <span className="font-medium">Aslam Khan vs Punjab</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy-400">Status</span>
                <CaseStatusBadge status="running" />
              </div>
            </div>
          </BottomSheet>

          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => { toast.success("Deleted!"); setConfirmOpen(false); }}
            title="Delete Case"
            message="Are you sure you want to delete this case? This action cannot be undone."
            confirmLabel="Delete"
            confirmVariant="danger"
          />
        </Section>

        {/* ── RTL Preview ──────────────────────────────────────────── */}
        <Section title="RTL / Urdu Preview">
          <div dir="rtl" className="space-y-3 font-urdu bg-white rounded-xl border border-navy-50 p-4">
            <h3 className="text-xl font-semibold text-navy text-end">مقدمہ تفصیل</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-navy-400 block text-end">مدعی</span>
                <span className="text-navy font-medium text-end block">فاطمہ بی بی</span>
              </div>
              <div>
                <span className="text-navy-400 block text-end">مدعاعلیہ</span>
                <span className="text-navy font-medium text-end block">ارسلان احمد</span>
              </div>
              <div>
                <span className="text-navy-400 block text-end">عدالت</span>
                <span className="text-navy font-medium text-end block">فیملی کورٹ لاہور</span>
              </div>
              <div>
                <span className="text-navy-400 block text-end">اگلی تاریخ</span>
                <span className="text-navy font-medium text-end block">15 جنوری 2025</span>
              </div>
            </div>
            <Textarea
              label="نوٹس"
              value={urduText}
              onChange={(e) => setUrduText(e.target.value)}
              rows={2}
            />
          </div>
        </Section>

        {/* ── Responsive note ──────────────────────────────────────── */}
        <div className="card border-l-4 border-gold text-sm text-navy-400">
          <strong className="text-navy">Responsive test:</strong> Resize to 375px to see mobile card lists, BottomSheet behaviour, and bottom nav.
          At 1440px+ the Table, Sidebar, and PageHeader layouts apply.
        </div>

      </div>
    </div>
  );
}
