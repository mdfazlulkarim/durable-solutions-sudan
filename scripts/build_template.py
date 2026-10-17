"""Build the Excel template for adding several projects at once:
    assets/templates/solutions-footprint-projects-template.xlsx

Run again after changing the organisation list, states, localities or columns:
    python3 scripts/build_template.py

scripts/build_data.py reads filled-in templates with the same COLUMNS, so a returned
template can be loaded straight into the data update.
"""
import json
from pathlib import Path

from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "templates" / "solutions-footprint-projects-template.xlsx"

CRITERIA = [
    "Safety and security", "Adequate standard of living", "Access to livelihoods and employment",
    "Housing, land and property", "Access to documentation", "Family reunification",
    "Participation in public affairs", "Access to effective remedies and justice",
]
INTERVENTION_TYPES = [
    "Basic services rehabilitation", "Livelihoods and cash-for-work", "Shelter and housing",
    "Legal aid and documentation", "Social cohesion and peacebuilding",
    "Local governance and urban planning", "Data, evidence and preparedness", "Family reunification support",
]
ORG_TYPES = ["UN agency", "International NGO", "National NGO", "Red Cross / Red Crescent", "Authorities", "Other"]
LEADERSHIP = ["Women-led organisation (WLO)", "Refugee-led organisation (RLO)", "Youth-led organisation (YLO)",
              "Organisation of persons with disabilities (OPD)"]
COORDINATION = [
    "Durable Solutions Working Group (DSWG)", "Area Durable Solutions Working Group (ADSWG)",
    "Information Management Working Group (IMWG)", "Protection Cluster", "Shelter Cluster",
    "Health Cluster", "Education Cluster", "WASH Cluster", "Food Security and Livelihoods Cluster",
    "Legal Aid Working Group", "Other",
]
STATUS = ["Ongoing", "Pipeline", "Ended"]
SCOPE = ["Nationwide", "One or more states"]

# key, header, width, required, help text (shown as a cell comment and on the Instructions sheet)
COLUMNS = [
    ("name", "Project or programme name", 40, True, "Full name of the project or programme."),
    ("description", "Short description", 40, False, "What the project does, in one or two sentences."),
    ("itypes", "Intervention type", 32, True, "One or more types, separated by semicolons (;). See the Lists sheet."),
    ("orgType", "Organisation type", 20, True, "Choose from the list."),
    ("lead", "Lead organisation", 24, True, "Choose from the list (acronym), or type the name if it is not listed."),
    ("leadership", "Organisation leadership", 28, False, "For national NGOs and other organisations: WLO, RLO, YLO or OPD, separated by semicolons. Leave empty if none apply."),
    ("partners", "Implementing partners", 28, False, "Acronyms from the Lists sheet where possible, separated by semicolons."),
    ("fpName", "Focal point name", 22, True, "Used by DSU to follow up. Not published."),
    ("fpEmail", "Focal point email", 28, True, "Used by DSU to follow up. Not published."),
    ("scope", "Geographic scope", 20, True, "Nationwide, or One or more states."),
    ("states", "States", 30, False, "Required unless nationwide. State names from the Lists sheet, separated by semicolons."),
    ("localities", "Localities", 30, False, "Locality names (OCHA admin 2) from the Localities sheet, separated by semicolons. Leave empty for nationwide projects."),
] + [(f"c{i}", f"IASC {i}. {c}", 14, False, f"Write Yes if the project contributes to criterion {i}: {c}. Choose at least one criterion.")
     for i, c in enumerate(CRITERIA, 1)] + [
    ("coordination", "Coordination mechanism or cluster", 30, False, "Choose from the list."),
    ("start", "Start date (YYYY-MM)", 14, True, "Month and year, for example 2026-01."),
    ("end", "End date (YYYY-MM)", 14, True, "Month and year, for example 2027-06."),
    ("status", "Status", 12, True, "Ongoing, Pipeline or Ended."),
    ("budget", "Total budget (USD)", 16, True, "Number in US dollars, without the $ sign."),
    ("share", "Share towards durable solutions (%)", 18, True, "Self-assessed: the percentage of the budget that helps people move towards durable solutions (restoring services, livelihoods, housing, documentation, social cohesion). Short-term relief such as food distribution or water trucking does not count."),
    ("dsFunding", "Funding towards durable solutions (USD)", 18, False, "Calculated automatically. Do not type here."),
    ("donor", "Donor or funding source", 24, False, "Optional."),
    ("pTotal", "People reached, planned: total", 14, False, "Leave empty if not known."),
    ("pIdps", "IDPs", 10, False, ""),
    ("pReturnees", "Returnees", 10, False, ""),
    ("pRefugees", "Refugees", 10, False, ""),
    ("pHost", "Host community", 12, False, ""),
    ("pOther", "Other", 10, False, ""),
    ("remarks", "Remarks", 30, False, ""),
    ("photos", "Photo file names", 24, False, "Up to 3 photos per project, JPG or PNG, under 1 MB each. Attach them to the email and write the file names here."),
    ("photoConsent", "Photo consent", 12, False, "Write Yes to confirm you have consent from the people shown to publish the photos."),
    ("consent", "Consent to publish", 12, True, "Write Yes to confirm the information can be published on the United Nations in Sudan website."),
]
HEADERS = {k: h for k, h, *_ in COLUMNS}

FONT = "Arial"
BLUE = "1D5FAE"
thin = Side(style="thin", color="D3D1C9")


def build():
    orgs = json.loads((ROOT / "data" / "organisations.json").read_text(encoding="utf-8"))["organisations"]
    locs = json.loads((ROOT / "data" / "localities.json").read_text(encoding="utf-8"))["states"]
    states = sorted(s for s in locs if s != "Abyei")

    wb = Workbook()
    # ---------- Instructions ----------
    ins = wb.active
    ins.title = "Instructions"
    ins.sheet_view.showGridLines = False
    ins.column_dimensions["A"].width = 4
    ins.column_dimensions["B"].width = 36
    ins.column_dimensions["C"].width = 100
    rows = [
        ("Solutions Footprint | Durable Solutions Hub | Sudan", "title"),
        ("Template for adding several projects at once", "sub"),
        ("", None),
        ("How to use this template", "h"),
        ("1. Fill in one row per project on the Projects sheet, starting in row 3. Row 2 is an example: overwrite or delete it.", None),
        ("2. Columns marked * are required. Yellow cells are the ones to fill in. Drop-down lists help where the answer comes from a fixed list.", None),
        ("3. Where a cell can hold several answers (intervention types, states, localities, partners), separate them with semicolons (;).", None),
        ("4. Funding towards durable solutions is calculated for you from the budget and the share.", None),
        ("5. Save the file and email it to dswg.sd@undp.org, with any project photos attached.", None),
        ("6. The Durable Solutions Unit reviews every project, may contact the focal point, and confirms when projects are published.", None),
        ("", None),
        ("What is published", "h"),
        ("All project information is published on the United Nations in Sudan website, except the focal point's name and email address.", None),
        ("This is not an exhaustive list of projects contributing to durable solutions in Sudan. It shows only projects reported to the Durable Solutions Working Group.", None),
        ("", None),
        ("Columns", "h"),
    ]
    r = 1
    for text, kind in rows:
        c = ins.cell(row=r, column=2, value=text)
        ins.merge_cells(start_row=r, start_column=2, end_row=r, end_column=3)
        c.alignment = Alignment(wrap_text=True, vertical="top")
        c.font = Font(name=FONT, size=16 if kind == "title" else 12 if kind == "sub" else 11,
                      bold=kind in ("title", "h"), color=BLUE if kind in ("title", "h") else "1C2230")
        if kind is None and text:
            ins.row_dimensions[r].height = 30
        r += 1
    for k, h, _, req, note in COLUMNS:
        ins.cell(row=r, column=2, value=h + (" *" if req else "")).font = Font(name=FONT, size=10, bold=True)
        n = ins.cell(row=r, column=3, value=note)
        n.font = Font(name=FONT, size=10)
        n.alignment = Alignment(wrap_text=True, vertical="top")
        r += 1
    ins.cell(row=r + 1, column=2, value="Questions: dswg.sd@undp.org").font = Font(name=FONT, size=10, italic=True)

    # ---------- Lists (for drop-downs) ----------
    ls = wb.create_sheet("Lists")
    lists = {
        "Organisation types": ORG_TYPES,
        "Organisations (acronym)": [o["acronym"] for o in orgs],
        "Organisation name": [o["name"] for o in orgs],
        "Organisation type": [o["type"] for o in orgs],
        "Intervention types": INTERVENTION_TYPES,
        "Organisation leadership": LEADERSHIP,
        "States": states,
        "Geographic scope": SCOPE,
        "Status": STATUS,
        "Coordination mechanism": COORDINATION,
        "Yes": ["Yes"],
    }
    refs = {}
    for ci, (title, vals) in enumerate(lists.items(), 1):
        col = get_column_letter(ci)
        ls.cell(row=1, column=ci, value=title).font = Font(name=FONT, bold=True, color="FFFFFF")
        ls.cell(row=1, column=ci).fill = PatternFill("solid", fgColor=BLUE)
        for ri, v in enumerate(vals, 2):
            ls.cell(row=ri, column=ci, value=v).font = Font(name=FONT, size=10)
        ls.column_dimensions[col].width = max(14, min(48, max(len(str(v)) for v in vals + [title]) + 2))
        refs[title] = f"Lists!${col}$2:${col}${len(vals) + 1}"
    ls.freeze_panes = "A2"

    # ---------- Localities by state ----------
    lc = wb.create_sheet("Localities")
    for ci, st in enumerate(states, 1):
        c = lc.cell(row=1, column=ci, value=st)
        c.font = Font(name=FONT, bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor=BLUE)
        for ri, v in enumerate(locs[st], 2):
            lc.cell(row=ri, column=ci, value=v).font = Font(name=FONT, size=10)
        lc.column_dimensions[get_column_letter(ci)].width = 22
    lc.freeze_panes = "A2"
    lc.cell(row=max(len(v) for v in locs.values()) + 3, column=1,
            value="Source: OCHA administrative boundaries for Sudan, admin 2 (localities), via geoBoundaries.").font = Font(name=FONT, size=9, italic=True)

    # ---------- Projects ----------
    ws = wb.create_sheet("Projects", 1)
    ws.freeze_panes = "B2"
    head_fill = PatternFill("solid", fgColor=BLUE)
    input_fill = PatternFill("solid", fgColor="FFF8D6")
    calc_fill = PatternFill("solid", fgColor="EEEDE8")
    example_fill = PatternFill("solid", fgColor="F1F6FC")
    N = 202  # rows 3..202 are ready for input
    col_of = {}
    for ci, (k, h, w, req, note) in enumerate(COLUMNS, 1):
        col_of[k] = get_column_letter(ci)
        c = ws.cell(row=1, column=ci, value=h + (" *" if req else ""))
        c.font = Font(name=FONT, bold=True, color="FFFFFF", size=10)
        c.fill = head_fill
        c.alignment = Alignment(wrap_text=True, vertical="center")
        c.border = Border(left=thin, right=thin)
        if note:
            c.comment = Comment(note, "DSU")
        ws.column_dimensions[get_column_letter(ci)].width = w
    ws.row_dimensions[1].height = 48

    example = {
        "name": "Example: Rehabilitation of water yards in Al Hasahisa",
        "description": "Rehabilitates two water yards and trains water committees.",
        "itypes": "Basic services rehabilitation; Social cohesion and peacebuilding",
        "orgType": "International NGO", "lead": "NRC", "leadership": "", "partners": "AORD; SRCS",
        "fpName": "Full name", "fpEmail": "name@organisation.org", "scope": "One or more states",
        "states": "Aj Jazirah", "localities": "Al Hasahisa", "c1": "Yes", "c2": "Yes",
        "coordination": "Area Durable Solutions Working Group (ADSWG)", "start": "2026-01", "end": "2027-06",
        "status": "Ongoing", "budget": 850000, "share": 0.6, "donor": "ECHO",
        "pTotal": 12000, "pIdps": 3000, "pReturnees": 6000, "pHost": 3000, "remarks": "", "consent": "Yes",
    }
    B, S = col_of["budget"], col_of["share"]
    for row in range(2, N + 1):
        for ci, (k, *_rest) in enumerate(COLUMNS, 1):
            c = ws.cell(row=row, column=ci)
            c.font = Font(name=FONT, size=10, italic=row == 2, color="5B6474" if row == 2 else "1C2230")
            c.border = Border(bottom=thin, left=thin, right=thin)
            c.alignment = Alignment(vertical="top", wrap_text=k in ("name", "description", "remarks", "itypes", "states", "localities", "partners"))
            if k == "dsFunding":
                c.value = f'=IF(AND(ISNUMBER({B}{row}),ISNUMBER({S}{row})),{B}{row}*{S}{row},"")'
                c.fill = calc_fill
                c.number_format = '"$"#,##0'
                continue
            c.fill = example_fill if row == 2 else input_fill
            if k == "budget":
                c.number_format = '"$"#,##0'
            elif k == "share":
                c.number_format = "0%"
            elif k.startswith("p") and k not in ("partners", "photos", "photoConsent"):
                c.number_format = "#,##0"
            elif k in ("start", "end"):
                c.number_format = "@"
            if row == 2 and k in example:
                c.value = example[k]

    def dv(formula, col, prompt=None, strict=True):
        v = DataValidation(type="list", formula1=formula, allow_blank=True, showErrorMessage=strict)
        if not strict:
            v.errorStyle = "information"
        if prompt:
            v.promptTitle, v.prompt, v.showInputMessage = "Tip", prompt, True
        v.add(f"{col}2:{col}{N}")
        ws.add_data_validation(v)

    dv(refs["Organisation types"], col_of["orgType"])
    dv(refs["Organisations (acronym)"], col_of["lead"], "Pick an acronym, or type the name if it is not listed.", strict=False)
    dv(refs["Geographic scope"], col_of["scope"])
    dv(refs["Status"], col_of["status"])
    dv(refs["Coordination mechanism"], col_of["coordination"])
    for i in range(1, 9):
        dv(refs["Yes"], col_of[f"c{i}"])
    for k in ("consent", "photoConsent"):
        dv(refs["Yes"], col_of[k])
    share = DataValidation(type="decimal", operator="between", formula1="0", formula2="1", allow_blank=True,
                           showErrorMessage=True, errorTitle="Share", error="Enter a percentage from 0% to 100%.")
    share.add(f"{S}2:{S}{N}")
    ws.add_data_validation(share)
    budget = DataValidation(type="decimal", operator="greaterThan", formula1="0", allow_blank=True,
                            showErrorMessage=True, errorTitle="Budget", error="Enter the budget in US dollars, as a number.")
    budget.add(f"{B}2:{B}{N}")
    ws.add_data_validation(budget)

    wb.active = 1
    for s in wb.worksheets:
        s.sheet_properties.tabColor = BLUE if s.title == "Projects" else "9AA0A9"
    wb.properties.creator = "Durable Solutions Unit, RCO Sudan"
    wb.properties.title = "Solutions Footprint: projects template"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUT)
    print("Wrote", OUT)


if __name__ == "__main__":
    build()
