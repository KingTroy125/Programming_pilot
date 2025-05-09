import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import { Search, Plus, Save, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/hooks/use-toast";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: query.trim()
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to get AI response');
      }

      const data = await response.json();
      if (!data.response) {
        throw new Error('Invalid response from AI');
      }

      toast({
        title: "AI Response",
        description: data.response,
      });
      setQuery(""); // Clear input after successful response
      setOpen(false); // Close the command palette
    } catch (error: any) {
      console.error("Failed to get AI response:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-8 w-full justify-start max-w-sm text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Type a command or search...
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <VisuallyHidden>
          <h2 id="command-dialog-title">Command Palette</h2>
          <p id="command-dialog-description">
            Use the command palette to navigate and perform actions.
          </p>
        </VisuallyHidden>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
          <CommandInput 
            placeholder="Ask AI Assistant..." 
            value={query}
            onValueChange={setQuery}
            aria-labelledby="command-dialog-title"
            aria-describedby="command-dialog-description"
            className="flex-1"
            autoFocus
          />
          <Button 
            type="submit"
            size="sm"
            className={`shrink-0 ${isLoading ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'} text-white`}
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="AI Assistant">
            <CommandItem
              onSelect={() => {
                if (!isLoading && query.trim()) {
                  void handleSubmit();
                }
              }}
              disabled={isLoading || !query.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              Ask AI Assistant
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                toast({
                  title: "New File",
                  description: "Creating new file...",
                });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New File
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                toast({
                  title: "Save",
                  description: "Saving changes...",
                });
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}