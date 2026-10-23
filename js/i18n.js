/**
 * LUMORA bilingual interface
 *
 * One dictionary, two complete interfaces. English is the source language and
 * Arabic is a full translation — not a partial overlay. UI code asks for a key
 * and never branches on language except where direction genuinely matters.
 */
import { loadLanguage, saveLanguage } from './storage.js';

export const LANGUAGES = ['en', 'ar'];
export const LANGUAGE_EVENT = 'lumora:languagechange';

const EN = {
  'app.title': 'LUMORA — Turn uncertainty into clarity',
  'app.description':
    'LUMORA is a local-first decision workspace. Compare options, weight what matters, and understand the trade-offs behind your choice.',
  'skip': 'Skip to content',

  'nav.how': 'How it works',
  'nav.workspace': 'Workspace',
  'nav.saved': 'Saved decisions',
  'nav.contact': 'Contact',
  'nav.primary': 'Primary navigation',
  'nav.mobile': 'Mobile navigation',
  'nav.footer': 'Footer navigation',
  'nav.start': 'Start a decision',
  'nav.switchLight': 'Switch to light theme',
  'nav.switchDark': 'Switch to dark theme',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.mobileNote': 'Local-first by design. No account, no cloud.',
  'nav.language': 'Language',
  'nav.langEn': 'English',
  'nav.langAr': 'Arabic',

  'hero.eyebrow': 'A quiet tool for consequential choices',
  'hero.line1': 'Too many possibilities.',
  'hero.rotating.0': 'Find your clarity.',
  'hero.rotating.1': 'Make room for what matters.',
  'hero.rotating.2': 'Turn uncertainty into clarity.',
  'hero.rotating.3': 'Find the path that feels right.',
  'hero.rotating.4': 'Your next step starts here.',
  'hero.lede':
    'Not every good option is right for you. Make room for what matters, compare the trade-offs honestly, and move forward with intention.',
  'hero.start': 'Start a decision',
  'hero.sample': 'Explore a sample',
  'hero.metaLabel': 'Product principles',
  'hero.meta.1': 'No account<br>needed',
  'hero.meta.2': 'Runs in<br>your browser',
  'hero.meta.3': 'Your priorities,<br>not ours',
  'hero.plate.note': 'Field note / 01',
  'hero.plate.study': 'Alignment study',
  'hero.data.options': 'Options',
  'hero.data.priorities': 'Priorities',
  'hero.data.ratings': 'Ratings',
  'hero.fig': 'FIG. 01',
  'hero.caption': 'A decision is not a verdict. It is a point of view you can examine.',

  'diagram.uncertainty': 'UNCERTAINTY / THREE PATHS',
  'diagram.signal': 'SIGNAL / SELECTED',
  'diagram.ratings': '0–10 RATINGS',
  'diagram.weights': '1–5 WEIGHTS',
  'diagram.options': '2–4 OPTIONS',
  'diagram.option1': "01 / CAMPUS MASTER'S",
  'diagram.option2': '02 / ONLINE STUDY',
  'diagram.option3': '03 / STUDIO PRACTICE',
  'diagram.point1': 'THE POINT',
  'diagram.point2': 'OF CLARITY',
  'diagram.notVerdict': 'NOT A VERDICT — A CLEARER VIEW',

  'signal.1': 'Compare 2–4 options',
  'signal.2': 'Weight what matters',
  'signal.3': 'Read the trade-offs',
  'signal.4': 'Decide with intention',
  'signal.label': 'How LUMORA thinks',

  'how.eyebrow': 'How it works',
  'how.title': 'Structure first.<br><em>Then perspective.</em>',
  'how.lede':
    'A decision feels heavy when everything is tangled together. LUMORA separates the pieces — then shows you how they combine.',
  'how.step1.kicker': 'Frame',
  'how.step1.title': 'Lay out your options.',
  'how.step1.body':
    'Name the real choices in front of you — from two to four — and describe what each one actually means.',
  'how.step1.mini1': 'Option 01',
  'how.step1.mini2': 'Option 02',
  'how.step1.mini3': 'Option 03',
  'how.step2.kicker': 'Weight',
  'how.step2.title': 'Define what matters.',
  'how.step2.body':
    'Give each criterion an importance from 1 to 5. A high weight tells the model that a small difference there matters more.',
  'how.step3.kicker': 'Read',
  'how.step3.title': 'Discover your trade-offs.',
  'how.step3.body':
    'See the weighted scores, the criteria doing the most work, and where your options gain or give ground.',
  'how.step3.label': 'CLARITY REPORT',
  'how.step3.strong': 'Weighted alignment',

  'default.cost': 'Cost',
  'default.quality': 'Quality',
  'default.time': 'Time',
  'default.future': 'Future opportunities',
  'sample.decision.title': 'Which way to study next year?',
  'sample.decision.description':
    'Weighing a formal master’s against flexible and practice-led routes. Illustrative scores, editable like any other decision.',
  'sample.option.campus.name': "Campus master's",
  'sample.option.campus.description':
    'Full-time, in-person programme with studio access and a built-in placement term.',
  'sample.option.online.name': 'Online specialisation',
  'sample.option.online.description':
    'Part-time remote modules. Flexible hours, no relocation, a smaller peer network.',
  'sample.option.studio.name': 'Studio apprenticeship',
  'sample.option.studio.description':
    'Paid studio role with mentorship. Learn on live client work, with less formal theory.',
  'sample.eyebrow': 'Illustrative example',
  'sample.notAdvice': 'Not advice',
  'sample.title': 'Which way<br>to study?',
  'sample.copy':
    'Three plausible paths, four priorities, and a different answer depending on what you value. Move the priorities and watch the logic change.',
  'sample.presets': 'Illustrative priority presets',
  'sample.preset.balanced': 'Balanced',
  'sample.preset.budget': 'Budget-led',
  'sample.preset.growth': 'Growth-led',
  'sample.footer':
    'Illustrative data only. Scores follow the weights above and are not an objective ranking or personal recommendation.',
  'sample.open': 'Open this sample',

  'workspace.eyebrow': 'Your workspace',
  'workspace.title': 'Your thinking,<br><em>kept close.</em>',
  'workspace.lede':
    'Decisions live in this browser, not on a server. Pick up where you left off, duplicate a path, or start somewhere new.',
  'workspace.library': 'Open the library',

  'contact.eyebrow': 'Contact',
  'contact.title': 'A quiet line<br><em>to us.</em>',
  'contact.lede':
    "Questions, ideas, or just a thought? Choose a message below and let's start a conversation.",
  'contact.email': 'Gmail',
  'contact.instagram': 'Instagram',
  'contact.whatsapp': 'WhatsApp',
  'contact.whatsappHint': 'Choose a message to start',
  'contact.directHeading': 'Direct',
  'contact.directHint': 'Email or Instagram',
  'contact.write': 'Write',
  'contact.open': 'Open profile',
  'contact.suggestion.hello.title': 'Say hello',
  'contact.suggestion.hello.description': 'A simple opening, with no agenda needed.',
  'contact.suggestion.hello.message': "Hi Mariam! I'd love to get in touch with you.",
  'contact.suggestion.question.title': 'Ask a question',
  'contact.suggestion.question.description': "Something about Lumora you'd like to understand.",
  'contact.suggestion.question.message': 'Hi Mariam! I have a question about Lumora.',
  'contact.suggestion.idea.title': 'Share an idea',
  'contact.suggestion.idea.description': 'A thought you think is worth building on.',
  'contact.suggestion.idea.message':
    "Hi Mariam! I have an idea I'd love to share with you about Lumora.",
  'contact.suggestion.feedback.title': 'Give feedback',
  'contact.suggestion.feedback.description': 'Tell me what works and what could be better.',
  'contact.suggestion.feedback.message':
    "Hi Mariam! I'd like to share some feedback about Lumora.",
  'contact.note':
    'Each message opens WhatsApp with the text already filled in. You can edit it and press Send yourself.',
  'contact.sectionLabel': 'Contact details',

  'closing.eyebrow': 'The next clear step',
  'closing.title': 'Turn uncertainty<br>into clarity.',
  'closing.start': 'Start a decision',
  'closing.sample': 'Try the illustrative sample',

  'footer.tagline':
    'Turn uncertainty into clarity.<br>A local-first decision workspace for thinking in the open.',
  'footer.noteLabel': 'Where your data lives',
  'footer.note':
    'Everything you enter stays in this browser via local storage. Nothing is uploaded, and nothing syncs between devices.',
  'footer.rights': '© {year} LUMORA',
  'footer.motto': 'No accounts. No cloud. No verdicts.',
  'footer.local': 'LOCAL / V1.0',
  'footer.home': 'LUMORA home',

  'studio.home': 'Home',
  'studio.new': 'Workspace · New decision',
  'studio.draft': 'Workspace · Unsaved draft',
  'studio.saved': 'Workspace · Saved locally',
  'studio.untitled': 'Untitled decision',
  'save.notSaved': 'Not saved yet',
  'save.unsaved': 'Unsaved changes',
  'save.saved': 'Saved in this browser',
  'save.save': 'Save decision',
  'save.update': 'Update saved decision',

  'steps.nav': 'Decision progress',
  'steps.setup': 'Setup',
  'steps.setupSub': 'Options & priorities',
  'steps.rate': 'Rate',
  'steps.rateSub': 'Fit, criterion by criterion',
  'steps.report': 'Report',
  'steps.reportSub': 'The trade-offs',

  'setup.eyebrow': 'Step 01 / Frame',
  'setup.heading': 'Frame the decision.',
  'setup.lede':
    'Give the choice a name, lay out your options, and decide what deserves weight.',
  'setup.sample': 'Load illustrative sample',
  'setup.titleLabel': 'Decision title',
  'setup.required': 'Required',
  'setup.titleHint': 'A short, honest name for the choice in front of you.',
  'setup.titlePlaceholder': 'e.g. Which studio should I join?',
  'setup.descLabel': 'Description',
  'setup.optional': 'Optional',
  'setup.descPlaceholder': 'What makes this decision difficult? Any constraints worth remembering?',
  'setup.descHint': '{count}/300 characters.',
  'setup.descChars': '/300 characters.',
  'setup.optionsHeading': 'Your options',
  'setup.optionsHelp': 'Two to four real paths. Names should be recognisable at a glance.',
  'setup.addOption': 'Add another option',
  'setup.criteriaHeading': 'What matters',
  'setup.criteriaHelp': 'Set an importance from 1 (nice to have) to 5 (non-negotiable).',
  'setup.addCriterion': 'Add a criterion',
  'setup.blank': 'Start blank',
  'setup.continue': 'Continue to ratings',
  'setup.removeOptionAria': 'Remove option {number}{name}',
  'setup.keepTwo': 'Keep at least two options',
  'setup.removeOption': 'Remove option',
  'setup.optionName': 'Option name',
  'setup.optionNamePh1': 'e.g. Stay in my current role',
  'setup.optionNamePh2': 'e.g. Move to a new city',
  'setup.optionDesc': 'Short description',
  'setup.optionDescPh': 'What does this path actually involve?',
  'setup.optionIndex': 'Option {number}',
  'setup.removeCriterionAria': 'Remove criterion {number}{name}',
  'setup.keepOne': 'Keep at least one criterion',
  'setup.removeCriterion': 'Remove criterion',
  'setup.criterionName': 'Criterion name',
  'setup.criterionPh': 'e.g. Quality of life',
  'setup.importance': 'Importance',
  'setup.weightValue': '{weight} / 5',
  'setup.issue.load': 'The decision could not be loaded.',
  'setup.issue.title': 'Give the decision a title.',
  'setup.issue.descLength': 'Keep the description to 300 characters or fewer.',
  'setup.issue.optionCount': 'Use between 2 and 4 options.',
  'setup.issue.optionName': 'Name option {number}.',
  'setup.issue.optionNameLength': 'Option {number} needs a name of 60 characters or fewer.',
  'setup.issue.optionDistinct': 'Option names need to be distinct.',
  'setup.issue.criteriaEmpty': 'Add at least one criterion.',
  'setup.issue.criteriaMax': 'Use a maximum of 12 criteria.',
  'setup.issue.criterionName': 'Name criterion {number}.',
  'setup.issue.criterionNameLength': 'Criterion {number} needs a name of 60 characters or fewer.',
  'setup.issue.criterionDistinct': 'Criterion names need to be distinct.',
  'setup.issue.weight': 'Importance for {name} must be from 1 to 5.',
  'setup.summary.details.one': '{count} detail to resolve before continuing.',
  'setup.summary.details.other': '{count} details to resolve before continuing.',
  'setup.summary.more': 'And {count} more.',
  'setup.toast.attention': 'A few setup details need attention before ratings.',
  'setup.toast.blank': 'A blank decision is ready.',

  'rate.eyebrow': 'Step 02 / Rate',
  'rate.heading': 'Rate with intention.',
  'rate.lede':
    'Score how each option performs against each criterion. Higher is always more favourable — for cost, 10 means most affordable.',
  'rate.complete': 'Ratings complete',
  'rate.note':
    'Leave a score blank until you mean it. LUMORA will not treat an empty score as zero.',
  'rate.clear': 'Clear all ratings',
  'rate.back': 'Edit setup',
  'rate.results': 'Build clarity report',
  'rate.aria': 'Rate {option} on {criterion} from 0 to 10',
  'rate.importance': 'Importance {weight} / 5',
  'rate.ratingsFor': 'Ratings for {option}',
  'rate.rated': '{filled} / {total} rated',
  'rate.cards': 'Rating cards',
  'rate.matrix': 'Rating matrix',
  'rate.corner': 'Criterion / option',
  'rate.rate010': 'Rate 0–10',
  'rate.untitledOption': 'Untitled option',
  'rate.untitledCriterion': 'Untitled criterion',
  'rate.preview.title': 'Live comparison',
  'rate.preview.copy':
    'A small preview of the weighted scores. The full report explains which criteria made the difference.',
  'rate.preview.ready': 'Ready to report',
  'rate.preview.left': '{count} left',
  'rate.preview.add.one':
    'Add {count} more rating to unlock the comparison. Blank scores stay blank — they are never treated as zero.',
  'rate.preview.add.other':
    'Add {count} more ratings to unlock the comparison. Blank scores stay blank — they are never treated as zero.',
  'rate.preview.error': 'The scores could not be calculated yet. Check the ratings above.',
  'rate.preview.tie':
    'The leading options are within {precision} points of each other, so this preview is a tie.',
  'rate.preview.lead':
    'Preview only: {name} currently has the closest alignment with your priorities.',
  'rate.preview.progress': '{name}: {filled}/{total}',
  'rate.preview.untitled': 'Untitled',
  'rate.summary.needed.one': '{count} rating still needed.',
  'rate.summary.needed.other': '{count} ratings still needed.',
  'rate.summary.entry': '{option} on {criterion}',
  'rate.summary.more': 'And {count} more.',
  'rate.toast.none': 'There are no ratings to clear.',
  'rate.toast.cleared': 'All ratings cleared. Blank scores are not treated as zero.',
  'rate.toast.allNeeded': 'Every option needs a rating for every criterion first.',
  'rate.toast.completeSetup': 'Complete the setup before moving to ratings.',
  'rate.toast.addAll': 'Add every rating before opening the report.',
  'rate.toast.finishSetup': 'Finish the setup before moving on.',
  'rate.toast.finishBeforeReport': 'Finish the comparison before opening its clarity report.',

  'report.eyebrow': 'Step 03 · Clarity',
  'report.heading': 'Your clarity report',
  'report.meta': '{title} · {options} · {criteria} · Generated locally',
  'report.edit': 'Edit comparison',
  'report.print': 'Print',
  'report.statement.lead': 'Based on your ratings, ',
  'report.statement.tail': ' aligns most closely with your stated priorities.',
  'report.statement.tie': '{names} are effectively tied based on your ratings.',
  'report.margin.tie':
    'Their weighted scores are within {precision} points of each other, so your inputs do not produce a clear leader.',
  'report.margin.lead': '{leader} leads {runner} by {margin} points out of 100.',
  'report.result.close': 'The result / a close call',
  'report.result.closest': 'The result / closest alignment',
  'report.tag.weighted': 'Weighted / 100',
  'report.tag.totalWeight': 'Total weight {weight}',
  'report.tag.tie': 'Tie within {precision} pts',
  'report.score.joint': 'Joint top alignment',
  'report.score.top': 'Top alignment',
  'report.score.tieNote': 'A tie in your inputs',
  'report.score.note': 'A mirror of your priorities',
  'report.tie.title': 'Too close to call within your chosen precision',
  'report.tie.body':
    '{names} score within {precision} points of each other. The comparison below shows where each one gives and takes; a small change in a high-weight rating could separate them.',
  'report.section.scores.title': 'Score comparison',
  'report.section.scores.sub':
    'Weighted alignment out of 100. A longer bar means a closer fit with the ratings and weights you supplied — not an objective truth.',
  'report.section.weights.title': 'What you weighted',
  'report.section.weights.sub':
    'Your criteria, ordered from highest importance to lowest. The bar shows importance out of 5.',
  'report.section.influence.title': 'What moved the result',
  'report.section.influence.sub':
    'Weights matter, but so does the gap between your ratings. These criteria did the most to separate the options.',
  'report.section.table.title': 'Criterion by criterion',
  'report.section.table.sub':
    'Raw ratings out of 10. The highest rating in each row is labelled Highest, so the pattern never relies on colour alone.',
  'report.section.pair.title': 'Where the difference lives',
  'report.section.pair.sub':
    'The leading option and its nearest comparator, criterion by criterion. Point values show each criterion’s contribution to the 100-point score.',
  'report.section.shape.title': 'The shape of each option',
  'report.section.shape.sub':
    'Each option’s strongest and weakest dimension, measured by contribution (rating × weight) rather than rating alone.',
  'report.chart.aria': '{option}: {score} out of 100',
  'report.leader.top': 'Top alignment',
  'report.leader.tied': 'Tied top',
  'report.untitledOption': 'Untitled option',
  'report.table.caption': 'Ratings for every option and criterion',
  'report.table.criterion': 'Criterion',
  'report.table.weight': 'Weight {weight} / 5',
  'report.table.highest': 'Highest',
  'report.pair.a': 'A · {name}',
  'report.pair.vs': 'versus',
  'report.pair.b': 'B · {name}',
  'report.pair.meta': 'A {a} / 100 · B {b} / 100',
  'report.pair.weight': 'Weight {weight} / 5',
  'report.pair.level': 'level',
  'report.pair.pts': '{delta} pts',
  'report.pair.ariaLevel': '{criterion}: level ratings',
  'report.pair.ariaLead': '{criterion}: {side} leads by {delta} weighted points',
  'report.pair.sideA': 'A',
  'report.pair.sideB': 'B',
  'report.pair.gain':
    '{leader} gains most on {criterion} ({a}/10 vs {b}/10 at weight {weight}), worth {points} points',
  'report.pair.give':
    '{target} closes ground on {criterion} ({b}/10 vs {a}/10), worth {points} points',
  'report.pair.join': '{parts}. Read together, these are the trade-offs behind the margin.',
  'report.pair.joiner': ', while ',
  'report.pair.tieNote':
    '{a} and {b} land within {precision} points of each other. Their differences are a matter of emphasis, not a decisive gap.',
  'report.tradeoff.strong': 'Strongest dimension',
  'report.tradeoff.weak': 'Weakest dimension',
  'report.tradeoff.meta': 'Weight {weight}/5 · contributes {points} pts',
  'report.caveat':
    '{note} Ties are detected when unrounded scores are within {precision} points; the report does not declare a winner inside that margin.',
  'report.note':
    'A score reflects only the criteria, weights, and ratings you supplied. It supports your judgement — it does not make the decision for you.',
  'report.actions.adjust': 'Adjust ratings',
  'report.actions.recalc': 'Recalculate',
  'report.actions.duplicate': 'Duplicate',
  'report.actions.startOver': 'Start over',
  'report.empty.title': 'This report is not ready yet.',
  'report.empty.body':
    'Finish the setup and add a rating for every option and criterion, then the clarity report can be calculated.',
  'report.empty.return': 'Return to ratings',
  'report.influence.entry': '{criterion} · weight {weight}',
  'report.influence.none':
    'All options scored {min}/10 here, so {criterion} did not separate them.',
  'report.influence.spread':
    '{criterion} spans {spread} rating points at weight {weight}, creating a {share}-point share of the score range.',
  'report.influence.empty': 'Not enough ratings to measure influence.',
  'report.toast.recalc': 'Clarity report recalculated from your inputs.',

  'saved.eyebrow': 'Local library',
  'saved.title': 'Saved decisions.',
  'saved.lede':
    'Comparisons you chose to keep. They stay in this browser and do not sync across devices.',
  'saved.new': 'New decision',
  'saved.searchLabel': 'Search saved decisions',
  'saved.searchPlaceholder': 'Title, option, or criterion',
  'saved.nothing': 'Nothing saved yet',
  'saved.shown': '{shown} of {total} shown',
  'saved.updated': 'Updated {date}',
  'saved.closest': 'Closest alignment',
  'saved.open': 'Open',
  'saved.duplicateAria': 'Duplicate {title}',
  'saved.deleteAria': 'Delete {title}',
  'saved.empty.title': 'A quiet place for clear thinking.',
  'saved.empty.body':
    'No decisions have been saved in this browser yet. A saved decision keeps its options, priorities, and ratings together — and never leaves this device.',
  'saved.empty.start': 'Start a decision',
  'saved.empty.sample': 'Open the sample',
  'saved.searchEmpty.title': 'No decision matches that search.',
  'saved.searchEmpty.body':
    'Try a title, an option, or a criterion. Your saved decisions are still here.',
  'saved.searchEmpty.clear': 'Clear search',
  'saved.notice.unavailable':
    'Browser storage is unavailable. Decisions saved now will only last for this session.',
  'saved.dialog.deleteTitle': 'Delete “{title}”?',
  'saved.dialog.deleteBody': 'This removes the decision from this browser. It cannot be undone.',
  'saved.dialog.deleteConfirm': 'Delete decision',
  'saved.toast.deleted': 'Decision deleted from this browser.',
  'saved.toast.duplicated': 'Duplicated as “{title}”.',
  'saved.toast.copySession': 'Copy made for this session only — browser storage is unavailable.',

  'landing.example.kicker': 'Illustrative scenario · {preset} priorities',
  'landing.example.tieLead':
    'With these priorities, the top options land within {precision} points: ',
  'landing.example.lead': 'With these priorities, ',
  'landing.example.tieTail': ' are effectively tied.',
  'landing.example.tail': ' carries the closest alignment.',
  'landing.example.gap': 'Score gap',
  'landing.example.points': 'points',
  'landing.example.aria': '{option}: {score} out of 100',
  'landing.example.criteria': 'Criteria and weights',
  'landing.example.error': 'The example could not be calculated.',
  'landing.empty.eyebrow': 'No saved work yet',
  'landing.empty.title': 'Clarity starts with a first sketch.',
  'landing.empty.body':
    'Nothing has been saved in this browser yet. Start from a blank decision, or open the illustrative sample and change it until it sounds like you.',
  'landing.empty.start': 'Start a decision',
  'landing.empty.sample': 'Try the sample',
  'landing.recent.needsReview': 'Needs review',
  'landing.recent.tied': 'Tied top',
  'landing.recent.local': 'Local',
  'landing.recent.closest': 'Closest alignment',
  'landing.recent.open': 'Open {title}',
  'landing.recent.viewAll': 'View all saved decisions',
  'landing.recent.desc': '{options} · {criteria}',

  'empty.fieldNote': 'FIELD NOTE / EMPTY',
  'empty.room': 'ROOM TO BEGIN',
  'empty.option1': 'Option 01',
  'empty.option2': 'Option 02',
  'empty.option3': 'Option 03',
  'empty.yourClarity': 'YOUR CLARITY',
  'empty.goesHere': 'GOES HERE',
  'empty.nothingSaved': 'NOTHING SAVED YET',
  'empty.space': 'SPACE TO THINK',

  'dialog.eyebrow': 'Please confirm',
  'dialog.title': 'Are you sure?',
  'dialog.cancel': 'Cancel',
  'dialog.confirm': 'Confirm',
  'dialog.close': 'Close',

  'confirm.startBlank.title': 'Start a blank decision?',
  'confirm.startBlank.body':
    'This clears the current comparison and its unsaved draft. Decisions you already saved stay in your library.',
  'confirm.startBlank.confirm': 'Start blank',
  'confirm.loadSample.title': 'Load the illustrative sample?',
  'confirm.loadSample.body':
    'This replaces the comparison currently open in your workspace. Saved decisions are not affected.',
  'confirm.loadSample.confirm': 'Load sample',
  'confirm.open.title': 'Open this saved decision?',
  'confirm.open.body':
    'Your current unsaved draft will be replaced. The saved decision itself stays untouched until you choose to update it.',
  'confirm.open.confirm': 'Open decision',
  'confirm.removeOption.title': 'Remove “{name}”?',
  'confirm.removeOption.body': 'Its ratings will be removed with it. The other options are untouched.',
  'confirm.removeOption.confirm': 'Remove option',
  'confirm.removeCriterion.title': 'Remove “{name}”?',
  'confirm.removeCriterion.body': 'Every rating recorded for this criterion will be removed too.',
  'confirm.removeCriterion.confirm': 'Remove criterion',
  'confirm.restart.title': 'Start over with a blank decision?',
  'confirm.restart.body':
    'The current comparison and its draft will be cleared. Saved decisions stay in your library.',
  'confirm.restart.confirm': 'Start over',

  'toast.themeRemember': 'Theme changed, but this browser could not remember it.',
  'toast.draftRestored': 'Restored your unsaved draft from this browser.',
  'toast.continueUnsaved': 'You have an unsaved decision open. Continue where you left off.',
  'toast.sampleLoaded': 'Illustrative sample loaded. Every input is yours to edit.',
  'toast.savedPersistent': 'Decision saved in this browser.',
  'toast.savedSession': 'Saved for this session only — browser storage is unavailable.',
  'toast.copyReady': 'A separate saved copy is ready.',
  'toast.storageUnavailable':
    'Browser storage is unavailable. This session works, but nothing will persist after it ends.',
  'toast.decisionLoad': 'The decision could not be loaded.',
  'toast.decisionOpen': 'That saved decision could not be opened.',
  'toast.decisionSave': 'The decision could not be saved.',
  'toast.decisionDuplicate': 'This decision could not be duplicated.',
  'toast.decisionDelete': 'The decision could not be deleted.',
  'toast.finishSetupSave': 'Complete the setup before saving.',
  'toast.allRatingsSave': 'Every option needs a rating before this can be saved.',
  'toast.finishSetupDuplicate': 'Finish the setup before duplicating.',
  'toast.finishRatingsDuplicate': 'Finish every rating before duplicating.',
  'toast.finishRecalc': 'Complete the setup and ratings before recalculating.',
  'toast.notFound': 'That decision could not be found.',

  'storage.quota': 'Browser storage is full. Free some space, then save again.',
  'storage.refusedSave': 'The browser refused to save this data.',
  'storage.refusedRemove': 'The browser refused to remove this data.',
  'storage.unreadableBackedUp':
    'Saved decisions were unreadable. A backup was kept and the library was reset.',
  'storage.unreadableNoBackup':
    'Saved decisions were unreadable and could not be backed up. Existing data was left untouched.',
  'storage.unexpected': 'The saved-decision library had an unexpected format.',
  'storage.skipped': '{count} saved decisions could not be read and were skipped.',
  'storage.incomplete': 'This decision is incomplete or contains invalid data, so it was not saved.',
  'storage.draftEmpty': 'The draft is empty.',
  'storage.draftUnreadable': 'The saved draft could not be read and was cleared.',
  'storage.draftCorrupt': 'The saved draft was corrupted and was cleared.',
  'storage.generic': 'The browser could not complete that request.',

  'duplicate.copy': 'copy',

  'common.undated': 'Undated',
  'common.local': 'Local',
  'common.generated': 'Generated locally',
  'common.options.one': '{count} option',
  'common.options.other': '{count} options',
  'common.criteria.one': '{count} criterion',
  'common.criteria.other': '{count} criteria',
  'common.priorities.one': '{count} priority',
  'common.priorities.other': '{count} priorities',
  'common.ratings.one': '{count} rating',
  'common.ratings.other': '{count} ratings',
  'common.decisions.one': '{count} decision',
  'common.decisions.other': '{count} decisions',
  'common.more': 'And {count} more.',
  'common.untitledOption': 'Untitled option',
  'common.untitledCriterion': 'Untitled criterion',
  'common.thisOption': 'this option',
  'common.thisCriterion': 'this criterion',
};

const AR = {
  'app.title': 'لومورا — حوّل التردد إلى وضوح',
  'app.description':
    'لومورا مساحة قرار محلية أولاً. قارن الخيارات، وحدّد وزن ما يهم، وافهم المقايضات التي تقف خلف اختيارك.',
  'skip': 'انتقل إلى المحتوى',

  'nav.how': 'كيف يعمل',
  'nav.workspace': 'مساحة العمل',
  'nav.saved': 'القرارات المحفوظة',
  'nav.contact': 'تواصل',
  'nav.primary': 'التنقل الرئيسي',
  'nav.mobile': 'تنقل الجوال',
  'nav.footer': 'تنقل التذييل',
  'nav.start': 'ابدأ قراراً',
  'nav.switchLight': 'التبديل إلى السمة الفاتحة',
  'nav.switchDark': 'التبديل إلى السمة الداكنة',
  'nav.openMenu': 'افتح القائمة',
  'nav.closeMenu': 'أغلق القائمة',
  'nav.mobileNote': 'محلي أولاً بالتصميم. بلا حساب، وبلا سحابة.',
  'nav.language': 'اللغة',
  'nav.langEn': 'English',
  'nav.langAr': 'العربية',

  'hero.eyebrow': 'أداة هادئة للخيارات المصيرية',
  'hero.line1': 'خيارات كثيرة جداً.',
  'hero.rotating.0': 'اعثر على وضوحك.',
  'hero.rotating.1': 'أفسح المجال لما يهم.',
  'hero.rotating.2': 'حوّل التردد إلى وضوح.',
  'hero.rotating.3': 'اعثر على الطريق الذي يبدو صائباً.',
  'hero.rotating.4': 'خطوتك التالية تبدأ من هنا.',
  'hero.lede':
    'ليس كل خيار جيد مناسباً لك. أفسح المجال لما يهم، وقارن المقايضات بصدق، ثم تقدّم بقصد.',
  'hero.start': 'ابدأ قراراً',
  'hero.sample': 'استكشف نموذجاً',
  'hero.metaLabel': 'مبادئ المنتج',
  'hero.meta.1': 'بلا حساب<br>شخصي',
  'hero.meta.2': 'يعمل في<br>متصفحك',
  'hero.meta.3': 'أولوياتك،<br>لا أولوياتنا',
  'hero.plate.note': 'ملاحظة ميدانية / 01',
  'hero.plate.study': 'دراسة التوافق',
  'hero.data.options': 'الخيارات',
  'hero.data.priorities': 'الأولويات',
  'hero.data.ratings': 'التقييمات',
  'hero.fig': 'شكل 01',
  'hero.caption': 'القرار ليس حكماً. إنه وجهة نظر تستطيع فحصها.',

  'diagram.uncertainty': 'الغموض / ثلاثة مسارات',
  'diagram.signal': 'الإشارة / المختار',
  'diagram.ratings': 'تقييمات 0–10',
  'diagram.weights': 'أوزان 1–5',
  'diagram.options': 'خيارات 2–4',
  'diagram.option1': '01 / ماجستير الحرم',
  'diagram.option2': '02 / دراسة عن بُعد',
  'diagram.option3': '03 / تدريب في الاستوديو',
  'diagram.point1': 'نقطة',
  'diagram.point2': 'الوضوح',
  'diagram.notVerdict': 'ليس حكماً — رؤية أوضح',

  'signal.1': 'قارن 2–4 خيارات',
  'signal.2': 'حدّد وزن ما يهم',
  'signal.3': 'اقرأ المقايضات',
  'signal.4': 'قرّر بقصد',
  'signal.label': 'كيف تفكّر لومورا',

  'how.eyebrow': 'كيف يعمل',
  'how.title': 'البنية أولاً.<br><em>ثم المنظور.</em>',
  'how.lede':
    'يشعرك القرار بالثقل حين تتشابك كل التفاصيل. تفصل لومورا الأجزاء، ثم تُريك كيف تتجمّع معاً.',
  'how.step1.kicker': 'التأطير',
  'how.step1.title': 'اعرض خياراتك.',
  'how.step1.body':
    'سمِّ الخيارات الحقيقية أمامك — من اثنين إلى أربعة — وصف ما يعنيه كل منها فعلاً.',
  'how.step1.mini1': 'الخيار 01',
  'how.step1.mini2': 'الخيار 02',
  'how.step1.mini3': 'الخيار 03',
  'how.step2.kicker': 'الوزن',
  'how.step2.title': 'حدّد ما يهم.',
  'how.step2.body':
    'امنح كل معيار أهمية من 1 إلى 5. الوزن المرتفع يعني أن الفارق الصغير فيه يستحق انتباهاً أكبر.',
  'how.step3.kicker': 'القراءة',
  'how.step3.title': 'اكتشف مقايضاتك.',
  'how.step3.body':
    'اطّلع على الدرجات الموزونة، والمعايير الأكثر تأثيراً، وأين يكسب كل خيار أو يخسر.',
  'how.step3.label': 'تقرير الوضوح',
  'how.step3.strong': 'التوافق الموزون',

  'default.cost': 'التكلفة',
  'default.quality': 'الجودة',
  'default.time': 'الوقت',
  'default.future': 'الفرص المستقبلية',
  'sample.decision.title': 'أي طريق أختار للدراسة العام القادم؟',
  'sample.decision.description':
    'موازنة بين ماجستير رسمي ومسارات مرنة قائمة على الممارسة. درجات توضيحية، قابلة للتعديل كأي قرار آخر.',
  'sample.option.campus.name': 'ماجستير في الحرم الجامعي',
  'sample.option.campus.description':
    'برنامج بدوام كامل وحضور شخصي مع إتاحة الاستوديو وفترة تدريب مدمجة.',
  'sample.option.online.name': 'تخصص عن بُعد',
  'sample.option.online.description':
    'وحدات عن بُعد بدوام جزئي. ساعات مرنة، بلا انتقال، وشبكة أقران أصغر.',
  'sample.option.studio.name': 'تدريب مهني في استوديو',
  'sample.option.studio.description':
    'دور مدفوع في استوديو مع إرشاد. تعلّم عبر أعمال عملاء حقيقية، بنظرية رسمية أقل.',
  'sample.eyebrow': 'مثال توضيحي',
  'sample.notAdvice': 'ليس نصيحة',
  'sample.title': 'أي طريق<br>للدراسة؟',
  'sample.copy':
    'ثلاثة مسارات معقولة، وأربع أولويات، وإجابة تختلف بحسب ما تقدّره. حرّك الأولويات وراقب تغيّر المنطق.',
  'sample.presets': 'إعدادات أولويات توضيحية',
  'sample.preset.balanced': 'متوازن',
  'sample.preset.budget': 'الميزانية أولاً',
  'sample.preset.growth': 'النمو أولاً',
  'sample.footer':
    'بيانات توضيحية فقط. تتبع الدرجات الأوزان أعلاه، وليست ترتيباً موضوعياً أو توصية شخصية.',
  'sample.open': 'افتح هذا النموذج',

  'workspace.eyebrow': 'مساحة عملك',
  'workspace.title': 'تفكيرك،<br><em>قريب منك.</em>',
  'workspace.lede':
    'تعيش القرارات في هذا المتصفح، لا على خادم. تابع من حيث توقفت، أو انسخ مساراً، أو ابدأ من مكان جديد.',
  'workspace.library': 'افتح المكتبة',

  'contact.eyebrow': 'تواصل',
  'contact.title': 'خط مباشر<br><em>إلينا.</em>',
  'contact.lede': 'أسئلة أو أفكار أو مجرد خاطرة؟ اختر رسالة أدناه ولنبدأ الحديث.',
  'contact.email': 'البريد الإلكتروني',
  'contact.instagram': 'إنستغرام',
  'contact.whatsapp': 'واتساب',
  'contact.whatsappHint': 'اختر رسالة للبدء',
  'contact.directHeading': 'مباشر',
  'contact.directHint': 'البريد أو إنستغرام',
  'contact.write': 'اكتب',
  'contact.open': 'افتح الملف الشخصي',
  'contact.suggestion.hello.title': 'قل مرحباً',
  'contact.suggestion.hello.description': 'بداية بسيطة، بلا حاجة إلى موضوع محدد.',
  'contact.suggestion.hello.message': 'مرحباً مريم! يسعدني أن أتواصل معك.',
  'contact.suggestion.question.title': 'اسأل سؤالاً',
  'contact.suggestion.question.description': 'سؤال عن لومورا تودّ فهمه.',
  'contact.suggestion.question.message': 'مرحباً مريم! لدي سؤال عن لومورا.',
  'contact.suggestion.idea.title': 'شارك فكرة',
  'contact.suggestion.idea.description': 'فكرة تعتقد أنها تستحق أن تُبنى عليها.',
  'contact.suggestion.idea.message': 'مرحباً مريم! لدي فكرة يسعدني مشاركتها معك عن لومورا.',
  'contact.suggestion.feedback.title': 'قدّم ملاحظاتك',
  'contact.suggestion.feedback.description': 'أخبرني بما ينجح وما يمكن تحسينه.',
  'contact.suggestion.feedback.message': 'مرحباً مريم! أود مشاركة بعض الملاحظات عن لومورا.',
  'contact.note':
    'كل رسالة تفتح واتساب مع النص مكتوباً مسبقاً. يمكنك تعديله والضغط على إرسال بنفسك.',
  'contact.sectionLabel': 'بيانات التواصل',

  'closing.eyebrow': 'الخطوة الواضحة التالية',
  'closing.title': 'حوّل التردد<br>إلى وضوح.',
  'closing.start': 'ابدأ قراراً',
  'closing.sample': 'جرّب النموذج التوضيحي',

  'footer.tagline':
    'حوّل التردد إلى وضوح.<br>مساحة قرار محلية أولاً للتفكير في العلن.',
  'footer.noteLabel': 'أين تعيش بياناتك',
  'footer.note':
    'كل ما تدخله يبقى في هذا المتصفح عبر التخزين المحلي. لا يُرفع شيء، ولا يُزامَن شيء بين الأجهزة.',
  'footer.rights': '© {year} لومورا',
  'footer.motto': 'بلا حسابات. بلا سحابة. بلا أحكام.',
  'footer.local': 'محلي / الإصدار 1.0',
  'footer.home': 'الصفحة الرئيسية لومورا',

  'studio.home': 'الرئيسية',
  'studio.new': 'مساحة العمل · قرار جديد',
  'studio.draft': 'مساحة العمل · مسودة غير محفوظة',
  'studio.saved': 'مساحة العمل · محفوظ محلياً',
  'studio.untitled': 'قرار بلا عنوان',
  'save.notSaved': 'غير محفوظ بعد',
  'save.unsaved': 'تغييرات غير محفوظة',
  'save.saved': 'محفوظ في هذا المتصفح',
  'save.save': 'احفظ القرار',
  'save.update': 'حدّث القرار المحفوظ',

  'steps.nav': 'تقدّم القرار',
  'steps.setup': 'الإعداد',
  'steps.setupSub': 'الخيارات والأولويات',
  'steps.rate': 'التقييم',
  'steps.rateSub': 'التوافق، معياراً بمعيار',
  'steps.report': 'التقرير',
  'steps.reportSub': 'المقايضات',

  'setup.eyebrow': 'الخطوة 01 / التأطير',
  'setup.heading': 'أطّر القرار.',
  'setup.lede': 'امنح الاختيار اسماً، واعرض خياراتك، وحدّد ما يستحق الوزن.',
  'setup.sample': 'حمّل النموذج التوضيحي',
  'setup.titleLabel': 'عنوان القرار',
  'setup.required': 'مطلوب',
  'setup.titleHint': 'اسم قصير وصادق للاختيار الذي أمامك.',
  'setup.titlePlaceholder': 'مثال: أي استوديو أنضم إليه؟',
  'setup.descLabel': 'الوصف',
  'setup.optional': 'اختياري',
  'setup.descPlaceholder': 'ما الذي يجعل هذا القرار صعباً؟ أي قيود تستحق التذكّر؟',
  'setup.descHint': '{count}/300 حرفاً.',
  'setup.descChars': '/300 حرفاً.',
  'setup.optionsHeading': 'خياراتك',
  'setup.optionsHelp': 'مساران إلى أربعة مسارات حقيقية. ينبغي أن تكون الأسماء واضحة من النظرة الأولى.',
  'setup.addOption': 'أضف خياراً آخر',
  'setup.criteriaHeading': 'ما يهم',
  'setup.criteriaHelp': 'حدّد أهمية من 1 (مستحسن) إلى 5 (غير قابل للتنازل).',
  'setup.addCriterion': 'أضف معياراً',
  'setup.blank': 'ابدأ فارغاً',
  'setup.continue': 'تابع إلى التقييمات',
  'setup.removeOptionAria': 'احذف الخيار {number}{name}',
  'setup.keepTwo': 'أبقِ خيارين على الأقل',
  'setup.removeOption': 'احذف الخيار',
  'setup.optionName': 'اسم الخيار',
  'setup.optionNamePh1': 'مثال: أبقى في دوري الحالي',
  'setup.optionNamePh2': 'مثال: أنتقل إلى مدينة جديدة',
  'setup.optionDesc': 'وصف قصير',
  'setup.optionDescPh': 'ماذا يتضمن هذا المسار فعلاً؟',
  'setup.optionIndex': 'الخيار {number}',
  'setup.removeCriterionAria': 'احذف المعيار {number}{name}',
  'setup.keepOne': 'أبقِ معياراً واحداً على الأقل',
  'setup.removeCriterion': 'احذف المعيار',
  'setup.criterionName': 'اسم المعيار',
  'setup.criterionPh': 'مثال: جودة الحياة',
  'setup.importance': 'الأهمية',
  'setup.weightValue': '{weight} / 5',
  'setup.issue.load': 'تعذّر تحميل القرار.',
  'setup.issue.title': 'امنح القرار عنواناً.',
  'setup.issue.descLength': 'أبقِ الوصف في حدود 300 حرف.',
  'setup.issue.optionCount': 'استخدم من 2 إلى 4 خيارات.',
  'setup.issue.optionName': 'سمِّ الخيار {number}.',
  'setup.issue.optionNameLength': 'يحتاج الخيار {number} إلى اسم من 60 حرفاً أو أقل.',
  'setup.issue.optionDistinct': 'يجب أن تكون أسماء الخيارات مختلفة.',
  'setup.issue.criteriaEmpty': 'أضف معياراً واحداً على الأقل.',
  'setup.issue.criteriaMax': 'استخدم 12 معياراً كحد أقصى.',
  'setup.issue.criterionName': 'سمِّ المعيار {number}.',
  'setup.issue.criterionNameLength': 'يحتاج المعيار {number} إلى اسم من 60 حرفاً أو أقل.',
  'setup.issue.criterionDistinct': 'يجب أن تكون أسماء المعايير مختلفة.',
  'setup.issue.weight': 'يجب أن تكون أهمية {name} من 1 إلى 5.',
  'setup.summary.details.one': 'تفصيل واحد يجب حلّه قبل المتابعة: {count}.',
  'setup.summary.details.other': 'تفاصيل يجب حلّها قبل المتابعة: {count}.',
  'setup.summary.more': 'و{count} أخرى.',
  'setup.toast.attention': 'هناك تفاصيل إعداد تحتاج إلى انتباه قبل التقييمات.',
  'setup.toast.blank': 'القرار الفارغ جاهز.',

  'rate.eyebrow': 'الخطوة 02 / التقييم',
  'rate.heading': 'قيّم بقصد.',
  'rate.lede':
    'امنح درجة لمدى أداء كل خيار أمام كل معيار. الأعلى أفضل دائماً — وفي التكلفة، تعني 10 الأكثر تيسّراً.',
  'rate.complete': 'اكتملت التقييمات',
  'rate.note': 'اترك الدرجة فارغة حتى تقصدها. لن تتعامل لومورا مع الدرجة الفارغة كصفر.',
  'rate.clear': 'امسح كل التقييمات',
  'rate.back': 'عدّل الإعداد',
  'rate.results': 'أنشئ تقرير الوضوح',
  'rate.aria': 'قيّم {option} على {criterion} من 0 إلى 10',
  'rate.importance': 'الأهمية {weight} / 5',
  'rate.ratingsFor': 'تقييمات {option}',
  'rate.rated': '{filled} / {total} مقيّمة',
  'rate.cards': 'بطاقات التقييم',
  'rate.matrix': 'مصفوفة التقييم',
  'rate.corner': 'المعيار / الخيار',
  'rate.rate010': 'قيّم 0–10',
  'rate.untitledOption': 'خيار بلا عنوان',
  'rate.untitledCriterion': 'معيار بلا عنوان',
  'rate.preview.title': 'مقارنة حيّة',
  'rate.preview.copy':
    'معاينة صغيرة للدرجات الموزونة. يشرح التقرير الكامل أي المعايير صنعت الفارق.',
  'rate.preview.ready': 'جاهز للتقرير',
  'rate.preview.left': 'بقي {count}',
  'rate.preview.add.one':
    'أضف تقييماً واحداً لفتح المقارنة. تبقى الدرجات الفارغة فارغة — ولا تُعامل كصفر.',
  'rate.preview.add.other':
    'أضف {count} تقييمات لفتح المقارنة. تبقى الدرجات الفارغة فارغة — ولا تُعامل كصفر.',
  'rate.preview.error': 'تعذّر حساب الدرجات بعد. راجع التقييمات أعلاه.',
  'rate.preview.tie': 'الخيارات المتصدّرة ضمن {precision} نقطة من بعضها، لذا هذه المعاينة تعادل.',
  'rate.preview.lead': 'معاينة فقط: {name} لديها حالياً أقرب توافق مع أولوياتك.',
  'rate.preview.progress': '{name}: {filled}/{total}',
  'rate.preview.untitled': 'بلا عنوان',
  'rate.summary.needed.one': 'ما زال تقييم واحد مطلوباً.',
  'rate.summary.needed.other': 'ما زالت {count} تقييمات مطلوبة.',
  'rate.summary.entry': '{option} على {criterion}',
  'rate.summary.more': 'و{count} أخرى.',
  'rate.toast.none': 'لا توجد تقييمات لمسحها.',
  'rate.toast.cleared': 'مُسحت كل التقييمات. الدرجات الفارغة لا تُعامل كصفر.',
  'rate.toast.allNeeded': 'يحتاج كل خيار إلى تقييم لكل معيار أولاً.',
  'rate.toast.completeSetup': 'أكمل الإعداد قبل الانتقال إلى التقييمات.',
  'rate.toast.addAll': 'أضف كل التقييمات قبل فتح التقرير.',
  'rate.toast.finishSetup': 'أكمل الإعداد قبل المتابعة.',
  'rate.toast.finishBeforeReport': 'أكمل المقارنة قبل فتح تقرير الوضوح.',

  'report.eyebrow': 'الخطوة 03 · الوضوح',
  'report.heading': 'تقرير وضوحك',
  'report.meta': '{title} · {options} · {criteria} · أُنشئ محلياً',
  'report.edit': 'عدّل المقارنة',
  'report.print': 'اطبع',
  'report.statement.lead': 'بناءً على تقييماتك، ',
  'report.statement.tail': ' الأقرب إلى أولوياتك المعلنة.',
  'report.statement.tie': '{names} متعادلة فعلياً بناءً على تقييماتك.',
  'report.margin.tie':
    'درجاتهما الموزونة ضمن {precision} نقطة من بعضها، لذا لا تُنتج مدخلاتك متصدّراً واضحاً.',
  'report.margin.lead': '{leader} تتقدّم على {runner} بفارق {margin} نقطة من 100.',
  'report.result.close': 'النتيجة / فارق ضيق',
  'report.result.closest': 'النتيجة / أقرب توافق',
  'report.tag.weighted': 'موزون / 100',
  'report.tag.totalWeight': 'الوزن الإجمالي {weight}',
  'report.tag.tie': 'تعادل ضمن {precision} نقطة',
  'report.score.joint': 'توافق مشترك في الصدارة',
  'report.score.top': 'أعلى توافق',
  'report.score.tieNote': 'تعادل في مدخلاتك',
  'report.score.note': 'مرآة لأولوياتك',
  'report.tie.title': 'متقاربان أكثر من أن نحسم داخل الدقة التي اخترتها',
  'report.tie.body':
    '{names} ضمن {precision} نقطة من بعضها. تُظهر المقارنة أدناه أين يعطي كل منهما ويأخذ؛ وقد يفصلهما تغيير صغير في تقييم عالي الوزن.',
  'report.section.scores.title': 'مقارنة الدرجات',
  'report.section.scores.sub':
    'التوافق الموزون من 100. الشريط الأطول يعني توافقاً أقرب مع التقييمات والأوزان التي قدمتها — وليس حقيقة موضوعية.',
  'report.section.weights.title': 'ما منحته وزناً',
  'report.section.weights.sub':
    'معاييرك مرتبة من الأعلى أهمية إلى الأقل. يُظهر الشريط الأهمية من 5.',
  'report.section.influence.title': 'ما حرّك النتيجة',
  'report.section.influence.sub':
    'للأوزان أهمية، لكن الفارق بين تقييماتك مهم أيضاً. هذه المعايير فعلت الأكثر لفصل الخيارات.',
  'report.section.table.title': 'معياراً بمعيار',
  'report.section.table.sub':
    'التقييمات الخام من 10. يُوسم أعلى تقييم في كل صف بـ«الأعلى»، حتى لا يعتمد النمط على اللون وحده.',
  'report.section.pair.title': 'أين يعيش الفارق',
  'report.section.pair.sub':
    'الخيار المتصدّر وأقرب منافس له، معياراً بمعيار. تُظهر قيم النقاط مساهمة كل معيار في درجة الـ100.',
  'report.section.shape.title': 'شكل كل خيار',
  'report.section.shape.sub':
    'أقوى وأضعف بُعد لكل خيار، محسوبين بالمساهمة (التقييم × الوزن) لا بالتقييم وحده.',
  'report.chart.aria': '{option}: {score} من 100',
  'report.leader.top': 'أعلى توافق',
  'report.leader.tied': 'متعادل في الصدارة',
  'report.untitledOption': 'خيار بلا عنوان',
  'report.table.caption': 'تقييمات كل خيار ومعيار',
  'report.table.criterion': 'المعيار',
  'report.table.weight': 'الوزن {weight} / 5',
  'report.table.highest': 'الأعلى',
  'report.pair.a': 'أ · {name}',
  'report.pair.vs': 'مقابل',
  'report.pair.b': 'ب · {name}',
  'report.pair.meta': 'أ {a} / 100 · ب {b} / 100',
  'report.pair.weight': 'الوزن {weight} / 5',
  'report.pair.level': 'متساوٍ',
  'report.pair.pts': '{delta} نقطة',
  'report.pair.ariaLevel': '{criterion}: تقييمات متساوية',
  'report.pair.ariaLead': '{criterion}: {side} تتقدّم بفارق {delta} نقطة موزونة',
  'report.pair.sideA': 'أ',
  'report.pair.sideB': 'ب',
  'report.pair.gain':
    '{leader} تكسب أكثر على {criterion} ({a}/10 مقابل {b}/10 بوزن {weight})، بما قيمته {points} نقطة',
  'report.pair.give':
    '{target} تقلّص الفارق على {criterion} ({b}/10 مقابل {a}/10)، بما قيمته {points} نقطة',
  'report.pair.join': '{parts}. مجتمعة، هذه هي المقايضات خلف الفارق.',
  'report.pair.joiner': '، بينما ',
  'report.pair.tieNote':
    '{a} و{b} ضمن {precision} نقطة من بعضهما. اختلافاتهما مسألة تركيز، لا فجوة حاسمة.',
  'report.tradeoff.strong': 'أقوى بُعد',
  'report.tradeoff.weak': 'أضعف بُعد',
  'report.tradeoff.meta': 'الوزن {weight}/5 · يساهم بـ{points} نقطة',
  'report.caveat':
    '{note} يُكتشف التعادل عندما تكون الدرجات غير المقربة ضمن {precision} نقطة؛ ولا يعلن التقرير فائزاً داخل هذا الهامش.',
  'report.note':
    'تعكس الدرجة فقط المعايير والأوزان والتقييمات التي قدمتها. إنها تدعم حكمك — ولا تتخذ القرار عنك.',
  'report.actions.adjust': 'عدّل التقييمات',
  'report.actions.recalc': 'أعد الحساب',
  'report.actions.duplicate': 'انسخ',
  'report.actions.startOver': 'ابدأ من جديد',
  'report.empty.title': 'هذا التقرير غير جاهز بعد.',
  'report.empty.body':
    'أكمل الإعداد وأضف تقييماً لكل خيار ومعيار، ثم يمكن حساب تقرير الوضوح.',
  'report.empty.return': 'عد إلى التقييمات',
  'report.influence.entry': '{criterion} · الوزن {weight}',
  'report.influence.none': 'كل الخيارات حصلت على {min}/10 هنا، لذا لم يفصل بينها {criterion}.',
  'report.influence.spread':
    'يمتد {criterion} على {spread} نقاط تقييم بوزن {weight}، ليصنع حصة {share} نقطة من مدى الدرجات.',
  'report.influence.empty': 'لا توجد تقييمات كافية لقياس التأثير.',
  'report.toast.recalc': 'أُعيد حساب تقرير الوضوح من مدخلاتك.',

  'saved.eyebrow': 'المكتبة المحلية',
  'saved.title': 'القرارات المحفوظة.',
  'saved.lede': 'مقارنات اخترت الاحتفاظ بها. تبقى في هذا المتصفح ولا تُزامَن بين الأجهزة.',
  'saved.new': 'قرار جديد',
  'saved.searchLabel': 'ابحث في القرارات المحفوظة',
  'saved.searchPlaceholder': 'عنوان أو خيار أو معيار',
  'saved.nothing': 'لا شيء محفوظ بعد',
  'saved.shown': '{shown} من {total} معروضة',
  'saved.updated': 'حُدّث {date}',
  'saved.closest': 'أقرب توافق',
  'saved.open': 'افتح',
  'saved.duplicateAria': 'انسخ {title}',
  'saved.deleteAria': 'احذف {title}',
  'saved.empty.title': 'مكان هادئ للتفكير الواضح.',
  'saved.empty.body':
    'لم تُحفظ أي قرارات في هذا المتصفح بعد. يحتفظ القرار المحفوظ بخياراته وأولوياته وتقييماته معاً — ولا يغادر هذا الجهاز.',
  'saved.empty.start': 'ابدأ قراراً',
  'saved.empty.sample': 'افتح النموذج',
  'saved.searchEmpty.title': 'لا يوجد قرار يطابق هذا البحث.',
  'saved.searchEmpty.body':
    'جرّب عنواناً أو خياراً أو معياراً. قراراتك المحفوظة ما زالت هنا.',
  'saved.searchEmpty.clear': 'امسح البحث',
  'saved.notice.unavailable':
    'التخزين في المتصفح غير متاح. القرارات المحفوظة الآن ستبقى لهذه الجلسة فقط.',
  'saved.dialog.deleteTitle': 'احذف «{title}»؟',
  'saved.dialog.deleteBody': 'يزيل هذا القرار من هذا المتصفح. لا يمكن التراجع.',
  'saved.dialog.deleteConfirm': 'احذف القرار',
  'saved.toast.deleted': 'حُذف القرار من هذا المتصفح.',
  'saved.toast.duplicated': 'نُسخ بعنوان «{title}».',
  'saved.toast.copySession': 'أُنجزت نسخة لهذه الجلسة فقط — التخزين في المتصفح غير متاح.',

  'landing.example.kicker': 'سيناريو توضيحي · أولويات {preset}',
  'landing.example.tieLead': 'مع هذه الأولويات، تقترب الخيارات المتصدّرة ضمن {precision} نقطة: ',
  'landing.example.lead': 'مع هذه الأولويات، ',
  'landing.example.tieTail': ' متعادلة فعلياً.',
  'landing.example.tail': ' تحمل أقرب توافق.',
  'landing.example.gap': 'فارق الدرجات',
  'landing.example.points': 'نقطة',
  'landing.example.aria': '{option}: {score} من 100',
  'landing.example.criteria': 'المعايير والأوزان',
  'landing.example.error': 'تعذّر حساب المثال.',
  'landing.empty.eyebrow': 'لا عمل محفوظ بعد',
  'landing.empty.title': 'الوضوح يبدأ برسم أول.',
  'landing.empty.body':
    'لم يُحفظ شيء في هذا المتصفح بعد. ابدأ بقرار فارغ، أو افتح النموذج التوضيحي وعدّله حتى يشبهك.',
  'landing.empty.start': 'ابدأ قراراً',
  'landing.empty.sample': 'جرّب النموذج',
  'landing.recent.needsReview': 'يحتاج مراجعة',
  'landing.recent.tied': 'متعادل في الصدارة',
  'landing.recent.local': 'محلي',
  'landing.recent.closest': 'أقرب توافق',
  'landing.recent.open': 'افتح {title}',
  'landing.recent.viewAll': 'اعرض كل القرارات المحفوظة',
  'landing.recent.desc': '{options} · {criteria}',

  'empty.fieldNote': 'ملاحظة ميدانية / فارغة',
  'empty.room': 'مساحة للبدء',
  'empty.option1': 'الخيار 01',
  'empty.option2': 'الخيار 02',
  'empty.option3': 'الخيار 03',
  'empty.yourClarity': 'وضوحك',
  'empty.goesHere': 'يظهر هنا',
  'empty.nothingSaved': 'لا شيء محفوظ بعد',
  'empty.space': 'مساحة للتفكير',

  'dialog.eyebrow': 'يرجى التأكيد',
  'dialog.title': 'هل أنت متأكد؟',
  'dialog.cancel': 'إلغاء',
  'dialog.confirm': 'تأكيد',
  'dialog.close': 'إغلاق',

  'confirm.startBlank.title': 'ابدأ قراراً فارغاً؟',
  'confirm.startBlank.body':
    'يمسح هذا المقارنة الحالية ومسودتها غير المحفوظة. تبقى القرارات التي حفظتها في مكتبتك.',
  'confirm.startBlank.confirm': 'ابدأ فارغاً',
  'confirm.loadSample.title': 'تحمّل النموذج التوضيحي؟',
  'confirm.loadSample.body':
    'يستبدل هذا المقارنة المفتوحة حالياً في مساحة عملك. لا تتأثر القرارات المحفوظة.',
  'confirm.loadSample.confirm': 'حمّل النموذج',
  'confirm.open.title': 'تفتح هذا القرار المحفوظ؟',
  'confirm.open.body':
    'ستُستبدل مسودتك غير المحفوظة. يبقى القرار المحفوظ كما هو حتى تختار تحديثه.',
  'confirm.open.confirm': 'افتح القرار',
  'confirm.removeOption.title': 'احذف «{name}»؟',
  'confirm.removeOption.body': 'ستُحذف تقييماته معه. تبقى الخيارات الأخرى كما هي.',
  'confirm.removeOption.confirm': 'احذف الخيار',
  'confirm.removeCriterion.title': 'احذف «{name}»؟',
  'confirm.removeCriterion.body': 'سيُحذف كل تقييم مسجل لهذا المعيار أيضاً.',
  'confirm.removeCriterion.confirm': 'احذف المعيار',
  'confirm.restart.title': 'تبدأ من جديد بقرار فارغ؟',
  'confirm.restart.body': 'ستُمسح المقارنة الحالية ومسودتها. تبقى القرارات المحفوظة في مكتبتك.',
  'confirm.restart.confirm': 'ابدأ من جديد',

  'toast.themeRemember': 'تغيّرت السمة، لكن هذا المتصفح لم يستطع تذكّرها.',
  'toast.draftRestored': 'استُعيدت مسودتك غير المحفوظة من هذا المتصفح.',
  'toast.continueUnsaved': 'لديك قرار غير محفوظ مفتوح. تابع من حيث توقفت.',
  'toast.sampleLoaded': 'حُمّل النموذج التوضيحي. كل مدخل قابل للتعديل.',
  'toast.savedPersistent': 'حُفظ القرار في هذا المتصفح.',
  'toast.savedSession': 'حُفظ لهذه الجلسة فقط — التخزين في المتصفح غير متاح.',
  'toast.copyReady': 'نسخة محفوظة منفصلة جاهزة.',
  'toast.storageUnavailable':
    'التخزين في المتصفح غير متاح. تعمل هذه الجلسة، لكن لن يبقى شيء بعد انتهائها.',
  'toast.decisionLoad': 'تعذّر تحميل القرار.',
  'toast.decisionOpen': 'تعذّر فتح ذلك القرار المحفوظ.',
  'toast.decisionSave': 'تعذّر حفظ القرار.',
  'toast.decisionDuplicate': 'تعذّر نسخ هذا القرار.',
  'toast.decisionDelete': 'تعذّر حذف القرار.',
  'toast.finishSetupSave': 'أكمل الإعداد قبل الحفظ.',
  'toast.allRatingsSave': 'يحتاج كل خيار إلى تقييم قبل الحفظ.',
  'toast.finishSetupDuplicate': 'أكمل الإعداد قبل النسخ.',
  'toast.finishRatingsDuplicate': 'أكمل كل التقييمات قبل النسخ.',
  'toast.finishRecalc': 'أكمل الإعداد والتقييمات قبل إعادة الحساب.',
  'toast.notFound': 'تعذّر العثور على ذلك القرار.',

  'storage.quota': 'تخزين المتصفح ممتلئ. أفرغ بعض المساحة ثم احفظ مجدداً.',
  'storage.refusedSave': 'رفض المتصفح حفظ هذه البيانات.',
  'storage.refusedRemove': 'رفض المتصفح إزالة هذه البيانات.',
  'storage.unreadableBackedUp': 'تعذّرت قراءة القرارات المحفوظة. أُبقيت نسخة احتياطية وأُعيدت المكتبة.',
  'storage.unreadableNoBackup':
    'تعذّرت قراءة القرارات المحفوظة وتعذّر نسخها احتياطياً. تُركت البيانات الحالية دون تغيير.',
  'storage.unexpected': 'كان تنسيق مكتبة القرارات المحفوظة غير متوقع.',
  'storage.skipped': 'تعذّرت قراءة {count} من القرارات المحفوظة وتم تجاوزها.',
  'storage.incomplete': 'هذا القرار غير مكتمل أو يحتوي بيانات غير صالحة، لذا لم يُحفظ.',
  'storage.draftEmpty': 'المسودة فارغة.',
  'storage.draftUnreadable': 'تعذّرت قراءة المسودة المحفوظة ومُسحت.',
  'storage.draftCorrupt': 'كانت المسودة المحفوظة تالفة ومُسحت.',
  'storage.generic': 'تعذّر على المتصفح إكمال ذلك الطلب.',

  'duplicate.copy': 'نسخة',

  'common.undated': 'بلا تاريخ',
  'common.local': 'محلي',
  'common.generated': 'أُنشئ محلياً',
  'common.options.zero': 'لا خيارات',
  'common.options.one': 'خيار واحد',
  'common.options.two': 'خياران',
  'common.options.few': '{count} خيارات',
  'common.options.many': '{count} خياراً',
  'common.options.other': '{count} خيار',
  'common.criteria.zero': 'لا معايير',
  'common.criteria.one': 'معيار واحد',
  'common.criteria.two': 'معياران',
  'common.criteria.few': '{count} معايير',
  'common.criteria.many': '{count} معياراً',
  'common.criteria.other': '{count} معيار',
  'common.priorities.zero': 'لا أولويات',
  'common.priorities.one': 'أولوية واحدة',
  'common.priorities.two': 'أولويتان',
  'common.priorities.few': '{count} أولويات',
  'common.priorities.many': '{count} أولوية',
  'common.priorities.other': '{count} أولوية',
  'common.ratings.zero': 'لا تقييمات',
  'common.ratings.one': 'تقييم واحد',
  'common.ratings.two': 'تقييمان',
  'common.ratings.few': '{count} تقييمات',
  'common.ratings.many': '{count} تقييماً',
  'common.ratings.other': '{count} تقييم',
  'common.decisions.zero': 'لا قرارات',
  'common.decisions.one': 'قرار واحد',
  'common.decisions.two': 'قراران',
  'common.decisions.few': '{count} قرارات',
  'common.decisions.many': '{count} قراراً',
  'common.decisions.other': '{count} قرار',
  'common.more': 'و{count} أخرى.',
  'common.untitledOption': 'خيار بلا عنوان',
  'common.untitledCriterion': 'معيار بلا عنوان',
  'common.thisOption': 'هذا الخيار',
  'common.thisCriterion': 'هذا المعيار',
};

const DICTIONARIES = { en: EN, ar: AR };

let currentLanguage = 'en';

export function normalizeLanguage(value) {
  return value === 'ar' ? 'ar' : 'en';
}

export function getLanguage() {
  return currentLanguage;
}

export function isRTL(lang = currentLanguage) {
  return lang === 'ar';
}

export function t(key, vars = {}, lang = currentLanguage) {
  const dictionary = DICTIONARIES[lang] || EN;
  let value = dictionary[key];
  if (value === undefined) value = EN[key];
  if (value === undefined) return key;
  return String(value).replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  );
}

export function tn(key, count, vars = {}, lang = currentLanguage) {
  let category = 'other';
  try {
    category = new Intl.PluralRules(lang).select(count);
  } catch {
    category = count === 1 ? 'one' : 'other';
  }
  const dictionary = DICTIONARIES[lang] || EN;
  const candidates = [`${key}.${category}`, `${key}.other`, `${key}.one`];
  for (const candidate of candidates) {
    if (dictionary[candidate] !== undefined) return t(candidate, { ...vars, count }, lang);
  }
  return t(key, { ...vars, count }, lang);
}

export function formatNumber(value, options = {}, lang = currentLanguage) {
  try {
    return new Intl.NumberFormat(lang, { numberingSystem: 'latn', ...options }).format(value);
  } catch {
    return String(value);
  }
}

export function formatDate(iso, lang = currentLanguage) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return t('common.undated', {}, lang);
  try {
    return new Intl.DateTimeFormat(lang, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      numberingSystem: 'latn',
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function formatList(values, lang = currentLanguage) {
  const list = Array.isArray(values) ? values.filter(Boolean) : [];
  if (!list.length) return '';
  try {
    return new Intl.ListFormat(lang, { type: 'conjunction' }).format(list);
  } catch {
    return list.join(lang === 'ar' ? ' و' : ', ');
  }
}

function translatedText(element, key) {
  const translation = t(key);
  const elementChildren = Array.from(element.children);
  if (elementChildren.length === 0) {
    element.textContent = translation;
    return;
  }
  // Preserve decorative icons and inline structure: replace only the text nodes.
  const textNodes = Array.from(element.childNodes).filter(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
  );
  if (textNodes.length) {
    textNodes[0].textContent = translation;
    textNodes.slice(1).forEach((node) => node.remove());
  } else {
    element.insertBefore(document.createTextNode(translation), element.firstChild);
  }
}

export function applyTranslations(root = document) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('[data-i18n]').forEach((element) => {
    translatedText(element, element.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-html]').forEach((element) => {
    element.innerHTML = t(element.dataset.i18nHtml);
  });
  root.querySelectorAll('[data-i18n-attr]').forEach((element) => {
    element.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attribute, key] = pair.split(':').map((part) => part && part.trim());
      if (attribute && key) element.setAttribute(attribute, t(key));
    });
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.setAttribute('placeholder', t(element.dataset.i18nPlaceholder));
  });
}

export function applyDocumentLanguage(lang) {
  const next = normalizeLanguage(lang);
  document.documentElement.lang = next;
  document.documentElement.dir = isRTL(next) ? 'rtl' : 'ltr';
  document.documentElement.dataset.lang = next;
  document.title = t('app.title', {}, next);
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', t('app.description', {}, next));
  applyTranslations(document);
  document.querySelectorAll('[data-lang-button]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.langButton === next));
  });
}

export function setLanguage(lang, { persist = true, notify = true } = {}) {
  const next = normalizeLanguage(lang);
  const changed = next !== currentLanguage;
  currentLanguage = next;
  applyDocumentLanguage(next);
  if (persist) saveLanguage(next);
  if (notify && changed) {
    window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: { language: next } }));
  }
  return next;
}

export function initLanguage() {
  const stored = loadLanguage();
  const boot = document.documentElement.dataset.lang || document.documentElement.lang;
  currentLanguage = normalizeLanguage(stored || boot || 'en');
  applyDocumentLanguage(currentLanguage);
  return currentLanguage;
}

export function languages() {
  return LANGUAGES.slice();
}

export function translationKeys(lang = currentLanguage) {
  const dictionary = DICTIONARIES[normalizeLanguage(lang)] || EN;
  return Object.keys(dictionary);
}
