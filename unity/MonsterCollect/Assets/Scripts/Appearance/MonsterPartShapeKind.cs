namespace MonsterCollect.Appearance
{
    /// <summary>Procedural silhouette recipes when no sprite override is assigned.</summary>
    public enum MonsterPartShapeKind
    {
        None,

        BodyRound,
        BodyOval,
        BodyAngular,
        BodyBlob,

        HeadRound,
        HeadPointed,
        HeadWide,
        HeadSmall,

        LimbsStub,
        LimbsLong,

        TailShort,
        TailLong,
        TailFin,

        EyesDot,
        EyesBig,
        EyesAngry,
        EyesSleepy,

        PatternStripes,
        PatternSpots,

        AccessoryHorn,
        AccessoryWings,
        AccessoryCrown
    }
}
