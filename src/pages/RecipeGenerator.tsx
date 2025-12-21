import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateSmartRecipes } from '@/services/aiService';
import { Loader2, ChefHat, Sparkles, Clock, BarChart, Bookmark, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Recipe } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RecipeGenerator: React.FC = () => {
    const { currentUser } = useAuth();
    const [ingredients, setIngredients] = useState('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [savedRecipes, setSavedRecipes] = useState<(Recipe & { id: string })[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [activeTab, setActiveTab] = useState('generate');

    // Fetch Saved Recipes
    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, `users/${currentUser.uid}/savedRecipes`),
            orderBy('savedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const saved = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Recipe & { id: string }));
            setSavedRecipes(saved);
        });

        return unsubscribe;
    }, [currentUser]);

    const navigate = useNavigate(); // Add navigation

    // Restore session and auto-generate if returning from signup
    useEffect(() => {
        const pendingIngredients = sessionStorage.getItem('pendingRecipeIngredients');
        if (pendingIngredients) {
            setIngredients(pendingIngredients);

            // If user is now logged in, auto-generate and clear storage
            if (currentUser) {
                // We need to trigger generation, but handleGenerate is an event handler.
                // Let's refactor generation logic or just call it directly.
                const runGeneration = async () => {
                    setLoading(true);
                    try {
                        const ingredientList = pendingIngredients.split(',').map(i => i.trim());
                        const result = await generateSmartRecipes(ingredientList);
                        setRecipes(result);
                        if (result.length > 0) {
                            toast.success("Recipes generated! Welcome back.");
                        }
                        sessionStorage.removeItem('pendingRecipeIngredients');
                    } catch (error) {
                        console.error(error);
                        toast.error("Failed to generate recipes.");
                    } finally {
                        setLoading(false);
                    }
                };
                runGeneration();
            }
        }
    }, [currentUser]);

    const handleGenerate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!ingredients.trim()) {
            toast.error("Please enter some ingredients");
            return;
        }

        // Anonymous User Flow
        if (!currentUser) {
            sessionStorage.setItem('pendingRecipeIngredients', ingredients);
            toast.info("Please create an account to generate recipes!", {
                action: {
                    label: "Register",
                    onClick: () => navigate('/signup')
                }
            });
            navigate('/signup');
            return;
        }

        setLoading(true);
        try {
            const ingredientList = ingredients.split(',').map(i => i.trim());
            const result = await generateSmartRecipes(ingredientList);
            setRecipes(result);
            if (result.length > 0) {
                toast.success("Recipes generated successfully!");
            } else {
                toast.info("No recipes found. Try different ingredients.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate recipes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRecipe = async (recipe: Recipe) => {
        if (!currentUser) {
            toast.error("Login to save recipes");
            return;
        }
        try {
            await addDoc(collection(db, `users/${currentUser.uid}/savedRecipes`), {
                ...recipe,
                savedAt: serverTimestamp()
            });
            toast.success("Recipe saved!");
        } catch (error) {
            console.error("Error saving recipe:", error);
            toast.error("Failed to save recipe");
        }
    };

    const handleDeleteRecipe = async (id: string) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, `users/${currentUser.uid}/savedRecipes`, id));
            toast.success("Recipe removed");
        } catch (error) {
            console.error("Error removing recipe:", error);
            toast.error("Failed to remove recipe");
        }
    };

    return (
        <div className="min-h-screen bg-background pb-12">
            <Navbar />

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="text-center mb-10 animate-fade-up">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
                        <ChefHat className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                        Zero Waste Kitchen
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Generate smart recipes from leftovers or access your personal cookbook.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto mb-8">
                        <TabsTrigger value="generate">Generate Recipes</TabsTrigger>
                        <TabsTrigger value="saved">Saved Cookbook ({savedRecipes.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="generate" className="animate-fade-in">
                        <div className="glass-card rounded-2xl p-6 md:p-8 mb-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                            <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="ingredients" className="sr-only">Ingredients</Label>
                                    <Input
                                        id="ingredients"
                                        placeholder="Enter ingredients (e.g., rice, carrots, milk)..."
                                        value={ingredients}
                                        onChange={(e) => setIngredients(e.target.value)}
                                        className="h-14 text-lg bg-background/50 focus:bg-background transition-colors"
                                        disabled={loading}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="h-14 px-8 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20 w-full sm:w-auto"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                            Cooking...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-5 w-5 mr-2" />
                                            Generate
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 animate-fade-up">
                            {recipes.map((recipe, index) => (
                                <RecipeCard
                                    key={index}
                                    recipe={recipe}
                                    index={index}
                                    onView={() => setSelectedRecipe(recipe)}
                                    onSave={() => handleSaveRecipe(recipe)}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="saved" className="animate-fade-in">
                        {savedRecipes.length === 0 ? (
                            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
                                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bookmark className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No saved recipes yet</h3>
                                <p className="text-muted-foreground">Generate delicious recipes and save them here for later!</p>
                                <Button
                                    variant="link"
                                    onClick={() => setActiveTab('generate')}
                                    className="mt-4 text-primary"
                                >
                                    Start Generating
                                </Button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {savedRecipes.map((recipe, index) => (
                                    <RecipeCard
                                        key={recipe.id}
                                        recipe={recipe}
                                        index={index}
                                        onView={() => setSelectedRecipe(recipe)}
                                        onDelete={() => handleDeleteRecipe(recipe.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>

            {/* Recipe Details Modal */}
            <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-orange-600 flex items-center gap-2">
                            <ChefHat className="h-6 w-6" />
                            {selectedRecipe?.title}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedRecipe?.description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-4 mb-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full"><Clock className="h-4 w-4" /> {selectedRecipe?.time}</span>
                        <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full"><BarChart className="h-4 w-4" /> {selectedRecipe?.difficulty}</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 border-b pb-1">
                                🛒 Ingredients
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                                {selectedRecipe?.ingredients?.map((ing, i) => (
                                    <li key={i}>{ing}</li>
                                )) || <p className="text-sm italic text-muted-foreground">Ingredients not listed.</p>}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 border-b pb-1">
                                👨‍🍳 Instructions
                            </h4>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                {selectedRecipe?.instructions?.map((step, i) => (
                                    <li key={i} className="pl-1"><span className="ml-1">{step}</span></li>
                                )) || <p className="text-sm italic text-muted-foreground">Instructions not listed.</p>}
                            </ol>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        {/* If it's a generated recipe (no ID) allow save here too? logic complex, skip for now */}
                        <Button onClick={() => setSelectedRecipe(null)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Helper Component for consistency
const RecipeCard: React.FC<{
    recipe: Recipe,
    index: number,
    onView: () => void,
    onSave?: () => void,
    onDelete?: () => void
}> = ({ recipe, index, onView, onSave, onDelete }) => (
    <div
        className="group bg-card hover:bg-muted/30 border rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
        style={{ animationDelay: `${index * 0.1}s` }}
    >
        <div className="flex gap-2 mb-3">
            <div className="px-2 py-1 bg-background/80 backdrop-blur rounded-full text-xs font-medium border flex items-center gap-1">
                <Clock className="h-3 w-3" /> {recipe.time}
            </div>
            <div className="px-2 py-1 bg-background/80 backdrop-blur rounded-full text-xs font-medium border flex items-center gap-1">
                <BarChart className="h-3 w-3" /> {recipe.difficulty}
            </div>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {recipe.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed flex-grow text-sm">
            {recipe.description}
        </p>

        <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="gap-1 hover:text-orange-500" onClick={onView}>
                    View
                </Button>
                {onSave && (
                    <Button variant="ghost" size="sm" className="gap-1 hover:text-blue-500" onClick={onSave}>
                        <Bookmark className="h-4 w-4" /> Save
                    </Button>
                )}
                {onDelete && (
                    <Button variant="ghost" size="sm" className="gap-1 hover:text-red-500" onClick={onDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    </div>
);

export default RecipeGenerator;
