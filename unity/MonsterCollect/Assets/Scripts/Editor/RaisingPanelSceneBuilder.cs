#if UNITY_EDITOR
using MonsterCollect.UI;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.Editor
{
    /// <summary>Builds the active-monster raising / training panel for the ranch scene.</summary>
    public static class RaisingPanelSceneBuilder
    {
        public static MonsterRaisingPanel Create(Transform parent, Font font)
        {
            var panelGo = SceneUIBuilder.CreateUIObject("RaisingPanel", parent);
            var panelRect = panelGo.GetComponent<RectTransform>();
            panelRect.anchorMin = new Vector2(0.02f, 0.16f);
            panelRect.anchorMax = new Vector2(0.56f, 0.88f);
            panelRect.offsetMin = Vector2.zero;
            panelRect.offsetMax = Vector2.zero;
            panelGo.AddComponent<Image>().color = new Color(0.13f, 0.13f, 0.18f, 0.95f);

            var raisingPanel = panelGo.AddComponent<MonsterRaisingPanel>();

            // Empty state
            var emptyGo = SceneUIBuilder.CreateUIObject("EmptyState", panelGo.transform);
            SceneUIBuilder.StretchFullScreen(emptyGo.GetComponent<RectTransform>());
            var emptyText = emptyGo.AddComponent<Text>();
            emptyText.font = font;
            emptyText.fontSize = 28;
            emptyText.alignment = TextAnchor.MiddleCenter;
            emptyText.color = new Color(0.65f, 0.65f, 0.72f);
            emptyText.text = "Set a monster as Active to begin training.";

            // Content root
            var contentGo = SceneUIBuilder.CreateUIObject("Content", panelGo.transform);
            SceneUIBuilder.StretchFullScreen(contentGo.GetComponent<RectTransform>());

            var previewGo = SceneUIBuilder.CreateUIObject("Preview", contentGo.transform);
            var previewRect = previewGo.GetComponent<RectTransform>();
            previewRect.anchorMin = new Vector2(0.03f, 0.52f);
            previewRect.anchorMax = new Vector2(0.28f, 0.95f);
            previewRect.offsetMin = Vector2.zero;
            previewRect.offsetMax = Vector2.zero;
            var previewImage = previewGo.AddComponent<RawImage>();

            var nameGo = SceneUIBuilder.CreateUIObject("Name", contentGo.transform);
            var nameRect = nameGo.GetComponent<RectTransform>();
            nameRect.anchorMin = new Vector2(0.3f, 0.86f);
            nameRect.anchorMax = new Vector2(0.97f, 0.96f);
            nameRect.offsetMin = Vector2.zero;
            nameRect.offsetMax = Vector2.zero;
            var nameText = nameGo.AddComponent<Text>();
            nameText.font = font;
            nameText.fontSize = 34;
            nameText.fontStyle = FontStyle.Bold;
            nameText.alignment = TextAnchor.MiddleLeft;
            nameText.color = Color.white;

            var statusGo = SceneUIBuilder.CreateUIObject("Status", contentGo.transform);
            var statusRect = statusGo.GetComponent<RectTransform>();
            statusRect.anchorMin = new Vector2(0.3f, 0.78f);
            statusRect.anchorMax = new Vector2(0.97f, 0.86f);
            statusRect.offsetMin = Vector2.zero;
            statusRect.offsetMax = Vector2.zero;
            var statusText = statusGo.AddComponent<Text>();
            statusText.font = font;
            statusText.fontSize = 22;
            statusText.alignment = TextAnchor.MiddleLeft;
            statusText.color = new Color(0.7f, 0.9f, 0.75f);

            CareMeterBar hunger = CreateMeter(contentGo.transform, font, "HungerMeter", 0.52f, 0.62f);
            CareMeterBar energy = CreateMeter(contentGo.transform, font, "EnergyMeter", 0.44f, 0.54f);
            CareMeterBar mood = CreateMeter(contentGo.transform, font, "MoodMeter", 0.36f, 0.46f);
            CareMeterBar lifespan = CreateMeter(contentGo.transform, font, "LifespanMeter", 0.28f, 0.38f);

            var attackGo = SceneUIBuilder.CreateUIObject("AttackText", contentGo.transform);
            var attackRect = attackGo.GetComponent<RectTransform>();
            attackRect.anchorMin = new Vector2(0.3f, 0.18f);
            attackRect.anchorMax = new Vector2(0.5f, 0.26f);
            attackRect.offsetMin = Vector2.zero;
            attackRect.offsetMax = Vector2.zero;
            var attackText = attackGo.AddComponent<Text>();
            attackText.font = font;
            attackText.fontSize = 26;
            attackText.fontStyle = FontStyle.Bold;
            attackText.alignment = TextAnchor.MiddleLeft;
            attackText.color = new Color(1f, 0.85f, 0.35f);

            var speedGo = SceneUIBuilder.CreateUIObject("SpeedText", contentGo.transform);
            var speedRect = speedGo.GetComponent<RectTransform>();
            speedRect.anchorMin = new Vector2(0.52f, 0.18f);
            speedRect.anchorMax = new Vector2(0.97f, 0.26f);
            speedRect.offsetMin = Vector2.zero;
            speedRect.offsetMax = Vector2.zero;
            var speedText = speedGo.AddComponent<Text>();
            speedText.font = font;
            speedText.fontSize = 26;
            speedText.fontStyle = FontStyle.Bold;
            speedText.alignment = TextAnchor.MiddleLeft;
            speedText.color = new Color(0.5f, 0.85f, 1f);

            var limitsGo = SceneUIBuilder.CreateUIObject("LimitsText", contentGo.transform);
            var limitsRect = limitsGo.GetComponent<RectTransform>();
            limitsRect.anchorMin = new Vector2(0.03f, 0.08f);
            limitsRect.anchorMax = new Vector2(0.97f, 0.16f);
            limitsRect.offsetMin = Vector2.zero;
            limitsRect.offsetMax = Vector2.zero;
            var limitsText = limitsGo.AddComponent<Text>();
            limitsText.font = font;
            limitsText.fontSize = 18;
            limitsText.alignment = TextAnchor.MiddleCenter;
            limitsText.color = new Color(0.7f, 0.7f, 0.75f);

            Button feedButton = CreateActionButton(contentGo.transform, font, "FeedButton", "Feed", 0.03f, 0.25f, 0.02f, 0.08f);
            Button restButton = CreateActionButton(contentGo.transform, font, "RestButton", "Rest", 0.27f, 0.49f, 0.02f, 0.08f);
            Button strengthButton = CreateActionButton(contentGo.transform, font, "StrengthButton", "Strength", 0.51f, 0.73f, 0.02f, 0.08f);
            Button agilityButton = CreateActionButton(contentGo.transform, font, "AgilityButton", "Agility", 0.75f, 0.97f, 0.02f, 0.08f);

            var actionMsgGo = SceneUIBuilder.CreateUIObject("ActionMessage", contentGo.transform);
            var actionMsgRect = actionMsgGo.GetComponent<RectTransform>();
            actionMsgRect.anchorMin = new Vector2(0.05f, 0.92f);
            actionMsgRect.anchorMax = new Vector2(0.95f, 0.98f);
            actionMsgRect.offsetMin = Vector2.zero;
            actionMsgRect.offsetMax = Vector2.zero;
            var actionMessageText = actionMsgGo.AddComponent<Text>();
            actionMessageText.font = font;
            actionMessageText.fontSize = 20;
            actionMessageText.alignment = TextAnchor.MiddleCenter;
            actionMessageText.color = new Color(0.75f, 0.95f, 0.8f);

            var feedbackGo = SceneUIBuilder.CreateUIObject("StatFeedback", contentGo.transform);
            var feedbackRect = feedbackGo.GetComponent<RectTransform>();
            feedbackRect.anchorMin = new Vector2(0.35f, 0.3f);
            feedbackRect.anchorMax = new Vector2(0.65f, 0.38f);
            feedbackRect.offsetMin = Vector2.zero;
            feedbackRect.offsetMax = Vector2.zero;
            var feedbackText = feedbackGo.AddComponent<Text>();
            feedbackText.font = font;
            feedbackText.fontSize = 36;
            feedbackText.fontStyle = FontStyle.Bold;
            feedbackText.alignment = TextAnchor.MiddleCenter;
            var statFeedback = feedbackGo.AddComponent<StatChangeFeedback>();
            var feedbackSo = new SerializedObject(statFeedback);
            feedbackSo.FindProperty("feedbackText").objectReferenceValue = feedbackText;
            feedbackSo.ApplyModifiedPropertiesWithoutUndo();

            var panelSo = new SerializedObject(raisingPanel);
            panelSo.FindProperty("contentRoot").objectReferenceValue = contentGo;
            panelSo.FindProperty("emptyRoot").objectReferenceValue = emptyGo;
            panelSo.FindProperty("monsterNameText").objectReferenceValue = nameText;
            panelSo.FindProperty("statusText").objectReferenceValue = statusText;
            panelSo.FindProperty("previewImage").objectReferenceValue = previewImage;
            panelSo.FindProperty("hungerMeter").objectReferenceValue = hunger;
            panelSo.FindProperty("energyMeter").objectReferenceValue = energy;
            panelSo.FindProperty("moodMeter").objectReferenceValue = mood;
            panelSo.FindProperty("lifespanMeter").objectReferenceValue = lifespan;
            panelSo.FindProperty("attackText").objectReferenceValue = attackText;
            panelSo.FindProperty("speedText").objectReferenceValue = speedText;
            panelSo.FindProperty("trainingLimitsText").objectReferenceValue = limitsText;
            panelSo.FindProperty("feedButton").objectReferenceValue = feedButton;
            panelSo.FindProperty("restButton").objectReferenceValue = restButton;
            panelSo.FindProperty("strengthButton").objectReferenceValue = strengthButton;
            panelSo.FindProperty("agilityButton").objectReferenceValue = agilityButton;
            panelSo.FindProperty("actionMessageText").objectReferenceValue = actionMessageText;
            panelSo.FindProperty("statFeedback").objectReferenceValue = statFeedback;
            panelSo.ApplyModifiedPropertiesWithoutUndo();

            return raisingPanel;
        }

        private static CareMeterBar CreateMeter(Transform parent, Font font, string name, float minY, float maxY)
        {
            var meterGo = SceneUIBuilder.CreateUIObject(name, parent);
            var meterRect = meterGo.GetComponent<RectTransform>();
            meterRect.anchorMin = new Vector2(0.3f, minY);
            meterRect.anchorMax = new Vector2(0.97f, maxY);
            meterRect.offsetMin = Vector2.zero;
            meterRect.offsetMax = Vector2.zero;

            var labelGo = SceneUIBuilder.CreateUIObject("Label", meterGo.transform);
            var labelRect = labelGo.GetComponent<RectTransform>();
            labelRect.anchorMin = new Vector2(0f, 0f);
            labelRect.anchorMax = new Vector2(0.22f, 1f);
            labelRect.offsetMin = Vector2.zero;
            labelRect.offsetMax = Vector2.zero;
            var labelText = labelGo.AddComponent<Text>();
            labelText.font = font;
            labelText.fontSize = 20;
            labelText.alignment = TextAnchor.MiddleLeft;
            labelText.color = Color.white;

            var barBgGo = SceneUIBuilder.CreateUIObject("BarBg", meterGo.transform);
            var barBgRect = barBgGo.GetComponent<RectTransform>();
            barBgRect.anchorMin = new Vector2(0.22f, 0.15f);
            barBgRect.anchorMax = new Vector2(0.88f, 0.85f);
            barBgRect.offsetMin = Vector2.zero;
            barBgRect.offsetMax = Vector2.zero;
            var barBg = barBgGo.AddComponent<Image>();
            barBg.color = new Color(0.08f, 0.08f, 0.1f);

            var fillGo = SceneUIBuilder.CreateUIObject("Fill", barBgGo.transform);
            SceneUIBuilder.StretchFullScreen(fillGo.GetComponent<RectTransform>());
            var fillImage = fillGo.AddComponent<Image>();
            fillImage.color = new Color(0.2f, 0.78f, 0.4f);
            fillImage.type = Image.Type.Filled;
            fillImage.fillMethod = Image.FillMethod.Horizontal;
            fillImage.fillOrigin = (int)Image.OriginHorizontal.Left;
            fillImage.fillAmount = 0.8f;

            var valueGo = SceneUIBuilder.CreateUIObject("Value", meterGo.transform);
            var valueRect = valueGo.GetComponent<RectTransform>();
            valueRect.anchorMin = new Vector2(0.88f, 0f);
            valueRect.anchorMax = new Vector2(1f, 1f);
            valueRect.offsetMin = Vector2.zero;
            valueRect.offsetMax = Vector2.zero;
            var valueText = valueGo.AddComponent<Text>();
            valueText.font = font;
            valueText.fontSize = 18;
            valueText.alignment = TextAnchor.MiddleRight;
            valueText.color = new Color(0.85f, 0.85f, 0.9f);

            var meter = meterGo.AddComponent<CareMeterBar>();
            var meterSo = new SerializedObject(meter);
            meterSo.FindProperty("fillImage").objectReferenceValue = fillImage;
            meterSo.FindProperty("labelText").objectReferenceValue = labelText;
            meterSo.FindProperty("valueText").objectReferenceValue = valueText;
            meterSo.ApplyModifiedPropertiesWithoutUndo();

            return meter;
        }

        private static Button CreateActionButton(
            Transform parent,
            Font font,
            string name,
            string label,
            float minX,
            float maxX,
            float minY,
            float maxY)
        {
            var buttonGo = SceneUIBuilder.CreateUIObject(name, parent);
            var buttonRect = buttonGo.GetComponent<RectTransform>();
            buttonRect.anchorMin = new Vector2(minX, minY);
            buttonRect.anchorMax = new Vector2(maxX, maxY);
            buttonRect.offsetMin = Vector2.zero;
            buttonRect.offsetMax = Vector2.zero;

            var buttonImage = buttonGo.AddComponent<Image>();
            buttonImage.color = new Color(0.18f, 0.48f, 0.82f, 0.95f);
            var button = buttonGo.AddComponent<Button>();

            var labelGo = SceneUIBuilder.CreateUIObject("Label", buttonGo.transform);
            SceneUIBuilder.StretchFullScreen(labelGo.GetComponent<RectTransform>());
            var labelText = labelGo.AddComponent<Text>();
            labelText.font = font;
            labelText.fontSize = 22;
            labelText.alignment = TextAnchor.MiddleCenter;
            labelText.color = Color.white;
            labelText.text = label;

            return button;
        }
    }
}
#endif
