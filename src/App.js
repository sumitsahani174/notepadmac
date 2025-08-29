import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Box,
  CssBaseline,
  Tooltip,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  useMediaQuery,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/NoteAdd";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SaveIcon from "@mui/icons-material/Save";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import FindReplaceIcon from "@mui/icons-material/FindReplace";
import CloseIcon from "@mui/icons-material/Close";
import WrapTextIcon from "@mui/icons-material/WrapText";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import DescriptionIcon from "@mui/icons-material/Description";
import JavascriptIcon from "@mui/icons-material/Javascript";
import CodeIcon from "@mui/icons-material/Code";
import MarkdownIcon from "@mui/icons-material/Article";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { styled } from "@mui/material/styles";
import { Editor } from "@monaco-editor/react";

// ============== Helpers ==============
const DEFAULT_CONTENT = "// Welcome to Notepad++-like Editor (React + MUI)\n// New file ready. Happy coding!\n";
const STORAGE_KEY = "mui-npp-project";

const languageIcon = (lang) => {
  switch (lang) {
    case "javascript":
      return <JavascriptIcon fontSize="small" />;
    case "typescript":
      return <CodeIcon fontSize="small" />;
    case "markdown":
      return <MarkdownIcon fontSize="small" />;
    case "json":
      return <CodeIcon fontSize="small" />;
      case "sql":
      return <CodeIcon fontSize="small" />;
    case "html":
      return <DescriptionIcon fontSize="small" />;
    case "css":
      return <DescriptionIcon fontSize="small" />;
    case "text":
    default:
      return <TextSnippetIcon fontSize="small" />;
  }
};

const languages = [
  { value: "text", label: "Plain Text" },
  { value: "markdown", label: "Markdown" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "json", label: "JSON" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
  
];

function download(filename, text) {
  const element = document.createElement("a");
  const file = new Blob([text], { type: "text/plain;charset=utf-8" });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ============== Styled Components ==============
const StatusBar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: 28,
  padding: "0 8px",
  borderTop: `1px solid ${theme.palette.divider}`,
  background: theme.palette.mode === "dark" ? theme.palette.background.default : theme.palette.grey[50],
  fontSize: 12,
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1),
}));

// ============== Main Component ==============
export default function NotepadPlusPlusMUI() {
  // Theme
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState(prefersDark ? "dark" : "light");
  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        shape: { borderRadius: 12 },
        typography: { fontFamily: ["Inter","Roboto","Segoe UI","Helvetica","Arial","sans-serif"].join(",") },
        components: {
          MuiButton: { styleOverrides: { root: { textTransform: "none" } } },
          MuiTab: { styleOverrides: { root: { minHeight: 36 } } },
          MuiToolbar: { styleOverrides: { root: { minHeight: 56 } } },
        },
      }),
    [mode]
  );

  // Drawer
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(!isSmall);
  useEffect(() => { setDrawerOpen(!isSmall); }, [isSmall]);

  // Project / Files state
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: crypto.randomUUID(), name: "untitled.txt", language: "text", content: DEFAULT_CONTENT, history: [], future: [] },
    ];
  });
  const [activeId, setActiveId] = useState(() => files[0]?.id || null);

  const activeIndex = files.findIndex(f => f.id === activeId);
  const activeFile = files[activeIndex] || null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }, [files]);

  // Editor options
  const [wordWrap, setWordWrap] = useState("on");
  const monacoRef = useRef(null);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });

  // Snackbar
  const [snack, setSnack] = useState({ open: false, message: "" });

  // Menus
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Find / Replace Dialog
  const [findOpen, setFindOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  // Language selection
  const [langMenuEl, setLangMenuEl] = useState(null);

  // ============== Actions ==============
  const createFile = useCallback((template = { name: "untitled.txt", language: "text", content: "" }) => {
    const newFile = { id: crypto.randomUUID(), history: [], future: [], ...template };
    setFiles((prev) => [...prev, newFile]);
    setActiveId(newFile.id);
  }, []);

  const openLocalFile = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await readFileAsText(file);
      const ext = file.name.split(".").pop()?.toLowerCase();
      const langGuess =
        ext === "md" ? "markdown" :
        ext === "js" ? "javascript" :
        ext === "ts" ? "typescript" :
        ext === "json" ? "json" :
        ext === "html" ? "html" :
        ext === "css" ? "css" : 
        ext === "sql" ? "sql" :
        ext === "py" ? "python" :
        ext === "java" ? "java" :
        ext === "cs" ? "csharp" :
        ext === "cpp" || ext === "cxx" || ext === "cc" ? "cpp" :
        ext === "rb" ? "ruby" :
        ext === "php" ? "php" :
        ext === "go" ? "go" :
        ext === "rs" ? "rust" :
        ext === "swift" ? "swift" :
        ext === "kt" ? "kotlin" :
        "text";

      createFile({ name: file.name, language: langGuess, content: String(text) });
      setSnack({ open: true, message: `Opened ${file.name}` });
    };
    input.click();
  }, [createFile]);

  const saveFile = useCallback(() => {
    if (!activeFile) return;
    download(activeFile.name, activeFile.content);
    setSnack({ open: true, message: `Saved ${activeFile.name}` });
  }, [activeFile]);

  const saveAs = useCallback(() => {
    if (!activeFile) return;
    const newName = prompt("Save As:", activeFile.name) || activeFile.name;
    download(newName, activeFile.content);
    setFiles((prev) => prev.map((f) => (f.id === activeFile.id ? { ...f, name: newName } : f)));
    setSnack({ open: true, message: `Saved as ${newName}` });
  }, [activeFile]);

  const closeTab = useCallback((id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (activeId === id) {
      // Switch to nearest tab
      const idx = files.findIndex((f) => f.id === id);
      const next = files[idx + 1] || files[idx - 1];
      setActiveId(next ? next.id : null);
    }
  }, [activeId, files]);

  const setContent = useCallback((id, content) => {
    setFiles((prev) => prev.map((f) => {
      if (f.id !== id) return f;
      return { ...f, content };
    }));
  }, []);

  const renameFile = useCallback((id, name) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
  }, []);

  const changeLanguage = useCallback((id, language) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, language } : f)));
  }, []);

  // Undo / Redo using Monaco commands
  const handleUndo = () => monacoRef.current?.trigger("keyboard", "undo", null);
  const handleRedo = () => monacoRef.current?.trigger("keyboard", "redo", null);

  const handleFind = () => setFindOpen(true);
  const handleReplace = () => setReplaceOpen(true);

  const performFind = () => {
    if (!findText) return;
    monacoRef.current?.getAction("actions.find").run();
    setTimeout(() => {
      const el = document.querySelector(".find-widget .monaco-inputbox input");
      if (el) {
        el.value = findText;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, 0);
  };

  const performReplaceAll = () => {
    if (!findText) return;
    const model = monacoRef.current?.getModel?.();
    if (!model) return;
    const value = model.getValue();
    const replaced = value.split(findText).join(replaceText);
    model.setValue(replaced);
    setContent(activeFile.id, replaced);
    setSnack({ open: true, message: `Replaced all '${findText}'` });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); saveFile(); }
      if (mod && e.key.toLowerCase() === "o") { e.preventDefault(); openLocalFile(); }
      if (mod && e.key.toLowerCase() === "n") { e.preventDefault(); createFile(); }
      if (mod && e.key.toLowerCase() === "f") { e.preventDefault(); handleFind(); }
      if (mod && e.key.toLowerCase() === "h") { e.preventDefault(); handleReplace(); }
      if (mod && e.shiftKey && e.key.toLowerCase() === "s") { e.preventDefault(); saveAs(); }
      if (mod && e.key === "Tab") { e.preventDefault();
        // Next tab
        const i = activeIndex;
        const next = files[(i + 1) % files.length];
        setActiveId(next.id);
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "tab") { e.preventDefault();
        // Prev tab
        const i = activeIndex;
        const prev = files[(i - 1 + files.length) % files.length];
        setActiveId(prev.id);
      }
      if (mod && e.key.toLowerCase() === "w") { e.preventDefault(); if (activeFile) closeTab(activeFile.id); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [files, activeIndex, activeFile, saveFile, openLocalFile, createFile, closeTab, saveAs]);

  // Monaco handlers
  const handleEditorMount = (editor, monaco) => {
    monacoRef.current = editor;
    editor.onDidChangeCursorPosition((e) => {
      setCursor({ line: e.position.lineNumber, column: e.position.column });
    });
  };

  // Sidebar (simple in-memory file list)
  const [contextAnchor, setContextAnchor] = useState(null);
  const [contextTarget, setContextTarget] = useState(null);
  const openContext = Boolean(contextAnchor);

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setContextAnchor(e.currentTarget);
    setContextTarget(file);
  };
  const closeContext = () => { setContextAnchor(null); setContextTarget(null); };

  const deleteFile = () => {
    if (!contextTarget) return;
    closeContext();
    closeTab(contextTarget.id);
  };

  const duplicateFile = () => {
    if (!contextTarget) return;
    const copy = { ...contextTarget, id: crypto.randomUUID(), name: contextTarget.name.replace(/(\.[^.]+)?$/, " copy$1") };
    setFiles((prev) => [...prev, copy]);
    setSnack({ open: true, message: `Duplicated ${contextTarget.name}` });
    closeContext();
  };

  // Layout sizes
  const drawerWidth = 260;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* AppBar */}
        <AppBar position="fixed" elevation={1} color="default" sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
          <Toolbar variant="dense" sx={{ gap: 1 }}>
            <IconButton edge="start" onClick={() => setDrawerOpen((v) => !v)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 2 }}>N++ (React + MUI)</Typography>

            <Tooltip title="New (Ctrl/Cmd + N)"><span><IconButton onClick={() => createFile()}><AddIcon /></IconButton></span></Tooltip>
            <Tooltip title="Open (Ctrl/Cmd + O)"><span><IconButton onClick={openLocalFile}><FolderOpenIcon /></IconButton></span></Tooltip>
            <Tooltip title="Save (Ctrl/Cmd + S)"><span><IconButton onClick={saveFile}><SaveIcon /></IconButton></span></Tooltip>
            <Tooltip title="Save As (Ctrl/Cmd + Shift + S)"><span><IconButton onClick={saveAs}><SaveAsIcon /></IconButton></span></Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Tooltip title="Undo"><span><IconButton onClick={handleUndo}><UndoIcon /></IconButton></span></Tooltip>
            <Tooltip title="Redo"><span><IconButton onClick={handleRedo}><RedoIcon /></IconButton></span></Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Tooltip title="Find (Ctrl/Cmd + F)"><span><IconButton onClick={handleFind}><FindInPageIcon /></IconButton></span></Tooltip>
            <Tooltip title="Replace (Ctrl/Cmd + H)"><span><IconButton onClick={handleReplace}><FindReplaceIcon /></IconButton></span></Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Tooltip title="Word Wrap"><span><IconButton onClick={() => setWordWrap((w) => (w === "on" ? "off" : "on"))}><WrapTextIcon /></IconButton></span></Tooltip>

            <Box sx={{ flexGrow: 1 }} />

            <ToggleButtonGroup size="small" value={mode} exclusive onChange={(_, v) => v && setMode(v)}>
              <ToggleButton value="light"><LightModeIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="dark"><DarkModeIcon fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>

            <IconButton onClick={handleMenu}>
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
              <MenuItem onClick={() => { handleMenuClose(); setSnack({ open: true, message: "Notepad++-like demo. Built with React, MUI, Monaco." }); }}>
                <InfoOutlinedIcon fontSize="small" style={{ marginRight: 8 }} /> About
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); localStorage.removeItem(STORAGE_KEY); setSnack({ open: true, message: "Cleared local project cache" }); }}>
                <DeleteIcon fontSize="small" style={{ marginRight: 8 }} /> Clear Local Cache
              </MenuItem>
            </Menu>
          </Toolbar>

          {/* Tabs Row */}
          <Box sx={{ px: 1, borderTop: (t) => `1px solid ${t.palette.divider}`, bgcolor: "background.paper" }}>
            <Tabs
              value={activeIndex === -1 ? false : activeIndex}
              variant="scrollable"
              scrollButtons
              allowScrollButtonsMobile
              onChange={(_, idx) => setActiveId(files[idx]?.id)}
            >
              {files.map((f) => (
                <Tab key={f.id}
                  iconPosition="start"
                  icon={languageIcon(f.language)}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span style={{ maxWidth: 160, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{f.name}</span>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); closeTab(f.id); }}>
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    </Box>
                  }
                  sx={{ minHeight: 36 }}
                />
              ))}
            </Tabs>
          </Box>
        </AppBar>

        {/* Sidebar */}
        <Drawer
          variant={isSmall ? "temporary" : "permanent"}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: (t) => `1px solid ${t.palette.divider}` },
          }}
        >
          <SidebarHeader>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Explorer</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="New File"><IconButton size="small" onClick={() => createFile()}><AddIcon fontSize="inherit" /></IconButton></Tooltip>
              <Tooltip title="Open Local File"><IconButton size="small" onClick={openLocalFile}><UploadFileIcon fontSize="inherit" /></IconButton></Tooltip>
              <Tooltip title="Download Active"><IconButton size="small" onClick={saveFile}><DownloadIcon fontSize="inherit" /></IconButton></Tooltip>
            </Box>
          </SidebarHeader>
          <Divider />
          <List dense sx={{ py: 0 }}>
            {files.map((f) => (
              <ListItem key={f.id} disablePadding onContextMenu={(e) => handleContextMenu(e, f)}>
                <ListItemButton selected={f.id === activeId} onClick={() => setActiveId(f.id)}>
                  <ListItemIcon>
                    {languageIcon(f.language)}
                  </ListItemIcon>
                  <ListItemText primary={f.name} secondary={f.language} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Menu anchorEl={contextAnchor} open={openContext} onClose={closeContext}>
            <MenuItem onClick={() => { closeContext(); const newName = prompt("Rename file", contextTarget?.name); if (newName) renameFile(contextTarget.id, newName); }}>Rename</MenuItem>
            <MenuItem onClick={duplicateFile}><ContentCopyIcon fontSize="small" sx={{ mr: 1 }} /> Duplicate</MenuItem>
            <MenuItem onClick={() => { download(contextTarget.name, contextTarget.content); closeContext(); }}><DownloadIcon fontSize="small" sx={{ mr: 1 }} /> Download</MenuItem>
            <MenuItem onClick={deleteFile} sx={{ color: "error.main" }}><DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete</MenuItem>
          </Menu>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column", height: "100vh" }}>
          <Toolbar />
          <Box sx={{ height: 36 }} />
          <Box sx={{ borderTop: (t) => `0px solid ${t.palette.divider}`, flexGrow: 1, minHeight: 0, pt: '36px' }}>            {activeFile ? (
              <Editor
                language={activeFile.language === "text" ? undefined : activeFile.language}
                value={activeFile.content}
                onMount={handleEditorMount}
                onChange={(val) => setContent(activeFile.id, val ?? "")}
                options={{
                  wordWrap,
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  renderWhitespace: "selection",
                  lineNumbers: "on",
                }}
                theme={mode === "dark" ? "vs-dark" : "light"}
                loading={<Box sx={{ p: 2 }}>Loading editor…</Box>}
                height="calc(100vh - 56px - 36px - 28px)" // appbar + tabs + statusbar
              />
            ) : (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6">No file open</Typography>
                <Typography variant="body2" color="text.secondary">Create a new file or open an existing one to begin.</Typography>
              </Box>
            )}
          </Box>

          {/* Status Bar */}
          <StatusBar>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton size="small" onClick={() => setDrawerOpen((v) => !v)}><ArrowBackIcon fontSize="inherit" /></IconButton>
              <Divider orientation="vertical" flexItem />
              <Typography>Ln {cursor.line}, Col {cursor.column}</Typography>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <Typography>UTF-8</Typography>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <Typography sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {activeFile && languageIcon(activeFile.language)} {activeFile?.language}
              </Typography>
            </Box>
            {activeFile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1 }}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel id="lang-select">Language</InputLabel>
                  <Select labelId="lang-select" label="Language" value={activeFile.language} onChange={(e) => changeLanguage(activeFile.id, e.target.value)}>
                    {languages.map((l) => (
                      <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </StatusBar>
        </Box>

        {/* Find Dialog */}
        <Dialog open={findOpen} onClose={() => setFindOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Find</DialogTitle>
          <DialogContent>
            <TextField autoFocus fullWidth label="Find text" value={findText} onChange={(e) => setFindText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") performFind(); }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFindOpen(false)}>Close</Button>
            <Button variant="contained" onClick={performFind}>Find</Button>
          </DialogActions>
        </Dialog>

        {/* Replace Dialog */}
        <Dialog open={replaceOpen} onClose={() => setReplaceOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Find & Replace</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField fullWidth label="Find" value={findText} onChange={(e) => setFindText(e.target.value)} />
            <TextField fullWidth label="Replace with" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReplaceOpen(false)}>Close</Button>
            <Button onClick={performFind}>Find</Button>
            <Button variant="contained" onClick={performReplaceAll}>Replace All</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snack.open} autoHideDuration={2800} onClose={() => setSnack({ open: false, message: "" })}>
          <Alert elevation={3} onClose={() => setSnack({ open: false, message: "" })} severity="info" sx={{ width: '100%' }}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
