#if UNITY_EDITOR
using MonsterCollect.UI;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.Editor
{
    /// <summary>Builds the ranch fusion / breeding overlay.</summary>
    public static class BreedingPanelSceneBuilder
    {
        public static MonsterBreedingPanel Create(Transform parent, Font font)
        {
            var panelRoot = SceneUIBuilder.CreateUIObject("BreedingPanel", parent);
            SceneUIBuilder.StretchFullScreen(panelRoot.GetComponent<RectTransform>());
            var breedingPanel = panelRoot.AddComponent<MonsterBreedingPanel>();

            var backdropGo = SceneUIBuilder.CreateUIObject("Backdrop", panelRoot.transform);
            SceneUIBuilder.StretchFullScreen(backdropGo.GetComponent<RectTransform>());
            backdropGo.AddComponent<Image>().color = new Color(0f, 0f, 0f, 0.82f);

            var cardGo = SceneUIBuilder.CreateUIObject("Card", panelRoot.transform);
            var cardRect = cardGo.GetComponent<RectTransform>();
            cardRect.anchorMin = new Vector2(0.12f, 0.08f);
            cardRect.anchorMax = new Vector2(0.88f, 0.92f);
            cardRect.offsetMin = Vector2.zero;
            cardRect.offsetMax = Vector2.zero;
            cardGo.AddComponent<Image>().color = new Color(0.11f, 0.11f, 0.15f, 0.98f);

            Text titleText = CreateLabel(cardGo.transform, font, "Title", "Fusion Lab", 38, FontStyle.Bold,
                new Vector2(0.05f, 0.9f), new Vector2(0.7f, 0.98f), TextAnchor.MiddleLeft, Color.white);

            Button closeButton = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "CloseButton", "Close",
                new Vector2(0.72f, 0.9f), new Vector2(0.95f, 0.98f));

            RawImage parentAPreview = CreatePreview(cardGo.transform, "ParentAPreview",
                new Vector2(0.05f, 0.58f), new Vector2(0.28f, 0.86f));
            RawImage parentBPreview = CreatePreview(cardGo.transform, "ParentBPreview",
                new Vector2(0.72f, 0.58f), new Vector2(0.95f, 0.86f));
            RawImage offspringPreview = CreatePreview(cardGo.transform, "OffspringPreview",
                new Vector2(0.36f, 0.58f), new Vector2(0.64f, 0.86f));

            Text parentANameText = CreateLabel(cardGo.transform, font, "ParentAName", "Parent A",
                24, FontStyle.Bold, new Vector2(0.05f, 0.52f), new Vector2(0.28f, 0.58f),
                TextAnchor.MiddleCenter, Color.white);
            Text parentBNameText = CreateLabel(cardGo.transform, font, "ParentBName", "Parent B",
                24, FontStyle.Bold, new Vector2(0.72f, 0.52f), new Vector2(0.95f, 0.58f),
                TextAnchor.MiddleCenter, Color.white);
            Text offspringNameText = CreateLabel(cardGo.transform, font, "OffspringName", "Fusion Preview",
                26, FontStyle.Bold, new Vector2(0.36f, 0.52f), new Vector2(0.64f, 0.58f),
                TextAnchor.MiddleCenter, new Color(0.85f, 0.95f, 1f));

            Button pickParentAButton = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "PickParentA", "Pick A",
                new Vector2(0.05f, 0.44f), new Vector2(0.28f, 0.51f));
            Button pickParentBButton = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "PickParentB", "Pick B",
                new Vector2(0.72f, 0.44f), new Vector2(0.95f, 0.51f));

            Text offspringStatsText = CreateLabel(cardGo.transform, font, "OffspringStats", "Select two different parents.",
                22, FontStyle.Normal, new Vector2(0.08f, 0.28f), new Vector2(0.92f, 0.42f),
                TextAnchor.UpperCenter, new Color(0.85f, 0.85f, 0.9f));
            Text affinityText = CreateLabel(cardGo.transform, font, "AffinityText", string.Empty,
                20, FontStyle.Normal, new Vector2(0.08f, 0.22f), new Vector2(0.92f, 0.28f),
                TextAnchor.MiddleCenter, new Color(0.65f, 0.85f, 0.95f));
            Text costText = CreateLabel(cardGo.transform, font, "CostText", string.Empty,
                20, FontStyle.Normal, new Vector2(0.08f, 0.1f), new Vector2(0.55f, 0.21f),
                TextAnchor.UpperLeft, new Color(0.75f, 0.75f, 0.82f));
            Text messageText = CreateLabel(cardGo.transform, font, "MessageText", string.Empty,
                20, FontStyle.Normal, new Vector2(0.08f, 0.02f), new Vector2(0.92f, 0.09f),
                TextAnchor.MiddleCenter, new Color(0.75f, 0.95f, 0.8f));

            Button breedButton = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "BreedButton", "Breed Fusion",
                new Vector2(0.58f, 0.1f), new Vector2(0.92f, 0.2f));
            var breedImage = breedButton.GetComponent<Image>();
            if (breedImage != null)
            {
                breedImage.color = new Color(0.55f, 0.22f, 0.72f, 0.95f);
            }

            _ = titleText;

            var panelSo = new SerializedObject(breedingPanel);
            panelSo.FindProperty("rootPanel").objectReferenceValue = panelRoot;
            panelSo.FindProperty("parentAPreview").objectReferenceValue = parentAPreview;
            panelSo.FindProperty("parentBPreview").objectReferenceValue = parentBPreview;
            panelSo.FindProperty("offspringPreview").objectReferenceValue = offspringPreview;
            panelSo.FindProperty("parentANameText").objectReferenceValue = parentANameText;
            panelSo.FindProperty("parentBNameText").objectReferenceValue = parentBNameText;
            panelSo.FindProperty("offspringNameText").objectReferenceValue = offspringNameText;
            panelSo.FindProperty("offspringStatsText").objectReferenceValue = offspringStatsText;
            panelSo.FindProperty("affinityText").objectReferenceValue = affinityText;
            panelSo.FindProperty("costText").objectReferenceValue = costText;
            panelSo.FindProperty("messageText").objectReferenceValue = messageText;
            panelSo.FindProperty("pickParentAButton").objectReferenceValue = pickParentAButton;
            panelSo.FindProperty("pickParentBButton").objectReferenceValue = pickParentBButton;
            panelSo.FindProperty("breedButton").objectReferenceValue = breedButton;
            panelSo.FindProperty("closeButton").objectReferenceValue = closeButton;
            panelSo.ApplyModifiedPropertiesWithoutUndo();

            panelRoot.SetActive(false);
            return breedingPanel;
        }

        private static RawImage CreatePreview(Transform parent, string name, Vector2 anchorMin, Vector2 anchorMax)
        {
            var previewGo = SceneUIBuilder.CreateUIObject(name, parent);
            var previewRect = previewGo.GetComponent<RectTransform>();
            previewRect.anchorMin = anchorMin;
            previewRect.anchorMax = anchorMax;
            previewRect.offsetMin = Vector2.zero;
            previewRect.offsetMax = Vector2.zero;
            previewGo.AddComponent<Image>().color = new Color(0.08f, 0.08f, 0.12f, 0.9f);
            return previewGo.AddComponent<RawImage>();
        }

        private static Text CreateLabel(
            Transform parent,
            Font font,
            string name,
            string text,
            int fontSize,
            FontStyle fontStyle,
            Vector2 anchorMin,
            Vector2 anchorMax,
            TextAnchor alignment,
            Color color)
        {
            var labelGo = SceneUIBuilder.CreateUIObject(name, parent);
            var labelRect = labelGo.GetComponent<RectTransform>();
            labelRect.anchorMin = anchorMin;
            labelRect.anchorMax = anchorMax;
            labelRect.offsetMin = Vector2.zero;
            labelRect.offsetMax = Vector2.zero;
            var labelText = labelGo.AddComponent<Text>();
            labelText.font = font;
            labelText.fontSize = fontSize;
            labelText.fontStyle = fontStyle;
            labelText.alignment = alignment;
            labelText.color = color;
            labelText.text = text;
            return labelText;
        }
    }
}
#endif
