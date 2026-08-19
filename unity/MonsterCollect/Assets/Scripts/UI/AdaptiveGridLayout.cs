using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Sizes a GridLayoutGroup from the available width so cards never clip.</summary>
    [DisallowMultipleComponent]
    [RequireComponent(typeof(GridLayoutGroup))]
    public class AdaptiveGridLayout : MonoBehaviour
    {
        [SerializeField] private int minColumns = 1;
        [SerializeField] private int maxColumns = 3;
        [SerializeField] private float cellAspect = 2.1f;
        [SerializeField] private float minCellWidth = 280f;
        [SerializeField] private float maxCellWidth = 520f;

        private GridLayoutGroup grid;
        private RectTransform rectTransform;
        private float lastWidth = -1f;

        private void Awake()
        {
            grid = GetComponent<GridLayoutGroup>();
            rectTransform = GetComponent<RectTransform>();
            Apply();
        }

        private void OnEnable()
        {
            Apply();
        }

        private void OnRectTransformDimensionsChange()
        {
            Apply();
        }

        private void LateUpdate()
        {
            if (rectTransform != null && !Mathf.Approximately(rectTransform.rect.width, lastWidth))
            {
                Apply();
            }
        }

        public void Apply()
        {
            if (grid == null)
            {
                grid = GetComponent<GridLayoutGroup>();
            }

            if (rectTransform == null)
            {
                rectTransform = GetComponent<RectTransform>();
            }

            if (grid == null || rectTransform == null)
            {
                return;
            }

            float width = rectTransform.rect.width;
            if (width <= 1f)
            {
                return;
            }

            lastWidth = width;
            float horizontalPad = grid.padding.left + grid.padding.right;
            float usable = Mathf.Max(80f, width - horizontalPad);

            int columns = Mathf.Clamp(Mathf.FloorToInt((usable + grid.spacing.x) / (minCellWidth + grid.spacing.x)), minColumns, maxColumns);
            columns = Mathf.Max(1, columns);

            float cellWidth = (usable - grid.spacing.x * (columns - 1)) / columns;
            cellWidth = Mathf.Clamp(cellWidth, minCellWidth * 0.7f, maxCellWidth);
            float cellHeight = Mathf.Clamp(cellWidth / Mathf.Max(0.5f, cellAspect), 140f, 280f);

            grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
            grid.constraintCount = columns;
            grid.cellSize = new Vector2(cellWidth, cellHeight);
            grid.childAlignment = TextAnchor.UpperCenter;
        }
    }
}
