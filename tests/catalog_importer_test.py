"""Test delle regole di classificazione dei file GLB ricevuti dal committente."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "tools"))

from catalog_importer import classify_family


class CatalogImporterTest(unittest.TestCase):
    """Verifica che i nomi GLB siano assegnati alla famiglia corretta."""

    # Protegge l'import delle colonne con vano libero superiore.
    def test_classify_family_recognizes_column_free_at_top(self) -> None:
        family, category, _, dimensions, hint = classify_family(
            "Colonna libera in alto Vista3D-{3D}"
        )

        self.assertEqual(family, "colonna-libera-alto")
        self.assertEqual(category, "colonne")
        self.assertEqual((dimensions.width_mm, dimensions.height_mm, dimensions.depth_mm), (700, 2282, 665))
        self.assertEqual(hint, "COLONNA CON")

    # Protegge l'import delle colonne con vano libero inferiore.
    def test_classify_family_recognizes_column_free_at_bottom(self) -> None:
        family, category, _, dimensions, hint = classify_family("Colonna libera sotto")

        self.assertEqual(family, "colonna-libera-basso")
        self.assertEqual(category, "colonne")
        self.assertEqual((dimensions.width_mm, dimensions.height_mm, dimensions.depth_mm), (700, 2282, 665))
        self.assertEqual(hint, "COLONNA CON")

    # Evita che un pensile venga scambiato per una colonna durante l'import.
    def test_classify_family_preserves_wall_unit_classification(self) -> None:
        family, category, _, dimensions, hint = classify_family("Pensile verticale")

        self.assertEqual(family, "pensile-verticale")
        self.assertEqual(category, "pensili")
        self.assertEqual((dimensions.width_mm, dimensions.height_mm, dimensions.depth_mm), (700, 878, 350))
        self.assertEqual(hint, "PENSILE VERTICALE")
